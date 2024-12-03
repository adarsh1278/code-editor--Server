const fileService = require('../services/fileService');
const terminalService = require('../services/terminalService');
const config = require('../config');
const chokidar = require('chokidar');

/**
 * Set up socket.io event handlers
 * @param {Object} io - Socket.io server instance
 */
function setupSocketHandlers(io) {
    // Set up file watcher
    chokidar.watch(config.USER_DIR).on('all', (event, path) => {
        io.emit('file:refresh', path);
    });
    
    // Terminal data handler
    terminalService.onData(data => {
        io.emit('terminal:data', data);
    });
    
    // Socket.io connection handler
    io.on('connection', (socket) => {
        console.log(`📡 Socket connected: ${socket.id}`);
    
        // Send initial file structure on connection
        socket.emit('file:refresh');
    
        // Handle file changes
        socket.on('file:change', async ({ path, content }) => {
            try {
                console.log(`📝 Updating file: ${path}`);
                await fileService.writeFile(path, content);
                socket.emit('file:update:success', { path });
            } catch (error) {
                console.error(`❌ Error updating file ${path}:`, error);
                socket.emit('file:update:error', { path, error: error.message });
            }
        });
    
        // Handle terminal input
        socket.on('terminal:write', (data) => {
            terminalService.write(data);
        });
    
        // Handle file creation
        socket.on('file:create', async ({ path, isDirectory }) => {
            try {
                if (isDirectory) {
                    console.log(`📁 Creating directory: ${path}`);
                } else {
                    console.log(`📄 Creating file: ${path}`);
                }
                
                await fileService.create(path, isDirectory);
                socket.emit('file:create:success', { path });
            } catch (error) {
                console.error(`❌ Error creating ${isDirectory ? 'directory' : 'file'} ${path}:`, error);
                socket.emit('file:create:error', { path, error: error.message });
            }
        });
    
        // Handle file deletion
        socket.on('file:delete', async ({ path }) => {
            try {
                console.log(`🗑️ Deleting: ${path}`);
                await fileService.delete(path);
                socket.emit('file:delete:success', { path });
            } catch (error) {
                console.error(`❌ Error deleting ${path}:`, error);
                socket.emit('file:delete:error', { path, error: error.message });
            }
        });
    
        // Handle terminal resize
        socket.on('terminal:resize', ({ cols, rows }) => {
            try {
                terminalService.resize(cols, rows);
            } catch (error) {
                console.error('❌ Error resizing terminal:', error);
            }
        });
    
        // Handle disconnection
        socket.on('disconnect', () => {
            console.log(`🔌 Socket disconnected: ${socket.id}`);
        });
    });
}

module.exports = { setupSocketHandlers };
