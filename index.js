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


const app = express()
const server = http.createServer(app);
const io = new SocketServer({
    cors: '*'
})

app.use(cors())

io.attach(server);

// console.log(tree)

chokidar.watch('./user').on('all', (event, path) => {
    io.emit('file:refresh', path)
});

ptyProcess.onData(data => {
    io.emit('terminal:data', data)
})

io.on('connection', (socket) => {
    console.log(`Socket connected`, socket.id)

    socket.emit('file:refresh')

    socket.on('file:change', async ({ path, content }) => {
        console.log("path is ===" , path)
        await fs.writeFile(`./${path}`, content)
    })

    socket.on('terminal:write', (data) => {
    
        ptyProcess.write(data);
    })
})
function id(){
    return Math.floor(Math.random() * 100000).toString();
}
app.get('/files', async (req, res) => {
    const tree = dirTree('./user',{ attributes: ["size", "type", "extension"]} );
 
    return res.json({ tree })
})

app.get('/files/content', async (req, res) => {
    const path = req.query.path;
    const content = await fs.readFile(`./user${path}`, 'utf-8')
    return res.json({ content })
})

server.listen(9000, () => console.log(`🐳 Docker server running on port 9000`))


