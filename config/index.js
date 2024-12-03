const path = require('path');
const os = require('os');

// Configuration constants
module.exports = {
    PORT: process.env.PORT || 9000,
    USER_DIR: './user',
    SHELL: os.platform() === 'win32' ? 'powershell.exe' : 'bash',
    TERMINAL_CONFIG: {
        name: 'xterm-color',
        cols: 80,
        rows: 30,
        cwd: path.join(process.cwd(), 'user'),
        env: process.env
    }
};
