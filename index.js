const http = require('http')
const express = require('express')
const fs = require('fs/promises')
const { Server: SocketServer } = require('socket.io')
const path = require('path')
const cors = require('cors')
const chokidar = require('chokidar');
const dirTree = require("directory-tree");
const pty = require('node-pty');
const os = require('os');

// Configuration
const PORT = process.env.PORT || 9000;
const USER_DIR = './user';

// Determine the shell to use based on the platform
const shell = os.platform() === 'win32' ? 'powershell.exe' : 'bash';

// Spawn a pseudo-terminal process
const ptyProcess = pty.spawn(shell, [], {
  name: 'xterm-color',
  cols: 80,
  rows: 30,
  cwd: path.join(__dirname, 'user'), // Ensure this path is correct
  env: process.env
});

// Initialize Express and HTTP server
const app = express()
const server = http.createServer(app);
const io = new SocketServer({
    cors: '*'
})

// Middleware
app.use(cors())
app.use(express.json())

// Attach socket.io to the server
io.attach(server);

// Set up file watcher
chokidar.watch(USER_DIR).on('all', (event, path) => {
    io.emit('file:refresh', path)
});

// Terminal data handler
ptyProcess.onData(data => {
    io.emit('terminal:data', data)
});

// Socket.io connection handler
io.on('connection', (socket) => {
    console.log(`📡 Socket connected: ${socket.id}`)

    // Send initial file structure on connection
    socket.emit('file:refresh')

    // Handle file changes
    socket.on('file:change', async ({ path, content }) => {
        try {
            console.log(`📝 Updating file: ${path}`)
            await fs.writeFile(`./${path}`, content)
            socket.emit('file:update:success', { path })
        } catch (error) {
            console.error(`❌ Error updating file ${path}:`, error)
            socket.emit('file:update:error', { path, error: error.message })
        }
    })

    // Handle terminal input
    socket.on('terminal:write', (data) => {
        ptyProcess.write(data);
    })

    // Handle file creation
    socket.on('file:create', async ({ path, isDirectory }) => {
        try {
            const fullPath = `./${path}`;
            
            if (isDirectory) {
                console.log(`📁 Creating directory: ${path}`)
                await fs.mkdir(fullPath, { recursive: true });
            } else {
                console.log(`📄 Creating file: ${path}`)
                // Create parent directories if they don't exist
                const dirPath = fullPath.substring(0, fullPath.lastIndexOf('/'));
                await fs.mkdir(dirPath, { recursive: true });
                await fs.writeFile(fullPath, '');
            }
            
            socket.emit('file:create:success', { path });
        } catch (error) {
            console.error(`❌ Error creating ${isDirectory ? 'directory' : 'file'} ${path}:`, error);
            socket.emit('file:create:error', { path, error: error.message });
        }
    })

    // Handle file deletion
    socket.on('file:delete', async ({ path }) => {
        try {
            const fullPath = `./${path}`;
            const stats = await fs.stat(fullPath);
            
            if (stats.isDirectory()) {
                console.log(`🗑️ Deleting directory: ${path}`)
                await fs.rm(fullPath, { recursive: true });
            } else {
                console.log(`🗑️ Deleting file: ${path}`)
                await fs.unlink(fullPath);
            }
            
            socket.emit('file:delete:success', { path });
        } catch (error) {
            console.error(`❌ Error deleting ${path}:`, error);
            socket.emit('file:delete:error', { path, error: error.message });
        }
    })

    // Handle terminal resize
    socket.on('terminal:resize', ({ cols, rows }) => {
        try {
            ptyProcess.resize(cols, rows);
        } catch (error) {
            console.error('❌ Error resizing terminal:', error);
        }
    })

    // Handle disconnection
    socket.on('disconnect', () => {
        console.log(`🔌 Socket disconnected: ${socket.id}`);
    })
})

// Helper function for generating IDs
function id(){
    return Math.floor(Math.random() * 100000).toString();
}

// API Routes
app.get('/files', async (req, res) => {
    try {
        const tree = dirTree(USER_DIR, { attributes: ["size", "type", "extension"] });
        return res.json({ tree })
    } catch (error) {
        console.error('❌ Error getting file tree:', error);
        return res.status(500).json({ error: 'Failed to get file tree' });
    }
})

app.get('/files/content', async (req, res) => {
    try {
        const path = req.query.path;
        if (!path) {
            return res.status(400).json({ error: 'Path parameter is required' });
        }
        
        const content = await fs.readFile(`./${path}`, 'utf-8')
        return res.json({ content })
    } catch (error) {
        console.error(`❌ Error reading file content:`, error);
        return res.status(500).json({ error: 'Failed to read file content' });
    }
})

// Health check endpoint
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok' });
});

// Start the server
server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`))


