const User = require('../Model/UserModel');
const Folder = require('../Model/FolderModel');

const resolveUploadPath = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const folderId = parseInt(req.query.folderId) || 0;
    console.log("RAW folderId from frontend:", req.body.folderId);
    console.log("Parsed folderId:", folderId);
    // Get username
    const user = await User.findByPk(userId, { attributes: ['name'] });
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Get folder name if folderId is provided
    let folderName = 'root'; // fallback
    if (folderId && folderId !== '0') {
      const folder = await Folder.findOne({
        where: { id: folderId, userId },
        attributes: ['name'],
      });
      console.log("folder name",folder)
      if (!folder) return res.status(404).json({ message: 'Folder not found' });

      folderName = folder.datavalues.name;
    }

    // Attach to request for multer to use
    req.uploadInfo = {
      username: user.dataValues.name,
      folderName: folderName,
    };

    next();
  } catch (err) {
    console.error('resolveUploadPath error:', err);
    res.status(500).json({ message: 'Failed to prepare upload path' });
  }
};

module.exports = resolveUploadPath;
