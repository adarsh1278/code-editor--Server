const fs = require('fs/promises');
const dirTree = require('directory-tree');
const config = require('../config');

/**
 * Service for file operations
 */
class FileService {
    /**
     * Get directory tree structure
     * @returns {Object} Directory tree
     */
    async getDirectoryTree() {
        return dirTree(config.USER_DIR, { attributes: ["size", "type", "extension"] });
    }

    /**
     * Get file content
     * @param {string} path - File path
     * @returns {string} File content
     */
    async getFileContent(path) {
        return await fs.readFile(`./${path}`, 'utf-8');
    }

    /**
     * Write content to file
     * @param {string} path - File path
     * @param {string} content - Content to write
     */
    async writeFile(path, content) {
        await fs.writeFile(`./${path}`, content);
    }

    /**
     * Create file or directory
     * @param {string} path - Path to create
     * @param {boolean} isDirectory - Whether path is directory
     */
    async create(path, isDirectory) {
        const fullPath = `./${path}`;
        
        if (isDirectory) {
            await fs.mkdir(fullPath, { recursive: true });
        } else {
            // Create parent directories if they don't exist
            const dirPath = fullPath.substring(0, fullPath.lastIndexOf('/'));
            if (dirPath.length > 1) { // Ensure we don't try to create root
                await fs.mkdir(dirPath, { recursive: true });
            }
            await fs.writeFile(fullPath, '');
        }
    }

    /**
     * Delete file or directory
     * @param {string} path - Path to delete
     */
    async delete(path) {
        const fullPath = `./${path}`;
        const stats = await fs.stat(fullPath);
        
        if (stats.isDirectory()) {
            await fs.rm(fullPath, { recursive: true });
        } else {
            await fs.unlink(fullPath);
        }
    }
}

module.exports = new FileService();
