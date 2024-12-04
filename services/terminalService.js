const pty = require('node-pty');
const config = require('../config');


class TerminalService {
    constructor() {
        // Spawn a pseudo-terminal process
        this.ptyProcess = pty.spawn(
            config.SHELL, 
            [], 
            config.TERMINAL_CONFIG
        );
    }

    /**
     * Get the terminal process
     * @returns {Object} The terminal process
     */
    getProcess() {
        return this.ptyProcess;
    }

    /**
     * Write data to terminal
     * @param {string} data - Data to write
     */
    write(data) {
        this.ptyProcess.write(data);
    }

    /**
     * Resize terminal dimensions
     * @param {number} cols - Number of columns
     * @param {number} rows - Number of rows
     */
    resize(cols, rows) {
        this.ptyProcess.resize(cols, rows);
    }

    /**
     * Set up data handler for terminal
     * @param {Function} callback - Callback function for data events
     */
    onData(callback) {
        this.ptyProcess.onData(callback);
    }
}

module.exports = new TerminalService();
