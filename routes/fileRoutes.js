const express = require('express');
const fileService = require('../services/fileService');
const router = express.Router();

/**
 * Get the file structure tree
 */
router.get('/', async (req, res) => {
    try {
        const tree = await fileService.getDirectoryTree();
        return res.json({ tree });
    } catch (error) {
        console.error('❌ Error getting file tree:', error);
        return res.status(500).json({ error: 'Failed to get file tree' });
    }
});

/**
 * Get file content
 */
router.get('/content', async (req, res) => {
    try {
        const path = req.query.path;
        if (!path) {
            return res.status(400).json({ error: 'Path parameter is required' });
        }
        
        const content = await fileService.getFileContent(path);
        return res.json({ content });
    } catch (error) {
        console.error(`❌ Error reading file content:`, error);
        return res.status(500).json({ error: 'Failed to read file content' });
    }
});

module.exports = router;
