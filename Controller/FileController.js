
const File = require('../Model/FileModel');
const Folder = require('../Model/FolderModel');
const User = require('../Model/UserModel');
const path = require('path');
const fs = require('fs');
const multer = require('multer');

// Update destination dynamically based on folderId
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const { username, folderName } = req.uploadInfo;
    console.log( folderName)
    const userFolder = path.join(__dirname, '..', 'uploads', username, folderName );

    // Ensure directory exists
    await fs.promises.mkdir(userFolder, { recursive: true });
    cb(null, userFolder);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const upload = multer({ storage });

const uploadFile = async (req, res) => {
  try {
    const file = req.file;
    const folderId = req.body.folderId || 0;
    console.log("folderId.....",folderId)

    if (!file) return res.status(400).json({ message: 'No file uploaded' });

    const newFile = await File.create({
      name: file.originalname,
      path: file.path,
      type: file.mimetype,
      size: file.size,
      folderId,
      userId: req.user.id 
    });

    res.status(201).json({ message: 'File uploaded', file: newFile });
  } catch (err) {
    console.error('Upload error:', err);
    res.status(500).json({ message: 'Upload failed' });
  }
};


// 🧾 Get files (optionally by folder)
const getFiles = async (req, res) => {
  try {
    const { folderId } = req.query;
  
    const condition = { userId: req.user.id };
    if (folderId !== undefined) condition.folderId = folderId;

    const files = await File.findAll({ where: condition });
    res.json(files);
  } catch (err) {
    console.error('Fetch error:', err);
    res.status(500).json({ message: 'Failed to fetch files' });
  }
};

// 🗑 Delete a file
const deleteFile = async (req, res) => {
  try {
    const fileId = req.params.id;
    const file = await File.findOne({
      where: { id: fileId, userId: req.user.id 
        
      }
    });

    if (!file) return res.status(404).json({ message: 'File not found' });

    await file.destroy(); // triggers the afterDestroy hook
    res.json({ message: 'File deleted' });
  } catch (err) {
    console.error('Delete error:', err);
    res.status(500).json({ message: 'Failed to delete file' });
  }
};
const updateFile = async (req, res) => {
    try {
      const fileId = req.params.id;
      const oldFile = await File.findByPk(fileId);
  
      if (!oldFile) {
        return res.status(404).json({ message: 'File not found' });
      }
  
      // Replace file if new file uploaded
      if (req.file) {
        // Remove old physical file
        if (fs.existsSync(oldFile.path)) {
          await fs.promises.unlink(oldFile.path);
        }
  
        oldFile.path = req.file.path;
        oldFile.name = req.file.originalname;
        oldFile.type = req.file.mimetype;
        oldFile.size = req.file.size;
      }
  
      // Optional metadata update
      const { name, folderId } = req.body;
      if (name) oldFile.name = name;
      if (folderId) oldFile.folderId = folderId;
  
      await oldFile.save();
  
      res.json({ message: 'File updated successfully', file: oldFile });
    } catch (err) {
      console.error('Update error:', err);
      res.status(500).json({ message: 'Failed to update file' });
    }
  };
  const downloadFile = async (req, res) => {
    const { id } = req.params;
    const userId = req.user.id; // from verifyToken middleware
  
    try {
      const file = await File.findOne({ where: { id, userId } });
  
      if (!file) {
        return res.status(404).json({ message: 'File not found' });
      }
  
      const filePath = path.resolve(file.path);
      
      if (!fs.existsSync(filePath)) {
        return res.status(404).json({ message: 'Physical file missing' });
      }
  
      res.download(filePath, file.name, (err) => {
        if (err) {
          console.error('Download error:', err);
          res.status(500).json({ message: 'Failed to download file' });
        }
      });
  
    } catch (err) {
      console.error('Download error:', err);
      res.status(500).json({ message: 'Server error' });
    }
  };
module.exports = { uploadMiddleware: upload.single('file'),uploadFile, getFiles, deleteFile,updateFile ,downloadFile};
