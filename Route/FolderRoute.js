const express = require('express');
const router = express.Router();
const { createFolder, getFolders, deleteFolder,updateFolder } = require('../Controller/FolderController');
const { verifyToken } = require('../Middleware/AuthMiddleware');

// Create new folder
router.post('/', verifyToken, createFolder);

// Get folders (pass parentId to get children)
router.get('/', verifyToken, getFolders);

// Delete folder by ID
router.delete('/:id', verifyToken, deleteFolder);
// Update folder by ID
router.put('/:id', verifyToken, updateFolder);


module.exports = router;
