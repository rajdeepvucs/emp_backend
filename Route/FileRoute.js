const express = require('express');
const router = express.Router();
const { uploadFile, getFiles, deleteFile,updateFile,downloadFile } = require('../Controller/FileController');

const {verifyToken} = require('../Middleware/AuthMiddleware'); 
const multer = require('multer');
const path = require('path');

// File storage config
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  }
});

const upload = multer({ storage });




router.post('/upload',verifyToken,  upload.single('file'), uploadFile);
router.get('/',verifyToken, getFiles);

router.delete('/:id',verifyToken,  deleteFile);
router.put('/:id', verifyToken,upload.single('file'), updateFile);

router.get('/download/:id', verifyToken, downloadFile);

module.exports = router;
