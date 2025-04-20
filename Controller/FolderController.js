const Folder = require('../Model/FolderModel');


exports.createFolder = async (req, res) => {
  const { name, parentId } = req.body;
  const userId = req.user.id;

  try {
    if (parentId) {
      
      const parentFolder = await Folder.findOne({ where: { id: parentId, userId } });
      if (!parentFolder) {
        return res.status(404).json({ message: 'Parent folder not found or not owned by user.' });
      }
    }

    const folder = await Folder.create({
      name,
      parentId: parentId || null,
      userId,
    });

    res.status(201).json({ message: 'Folder created successfully', folder });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create folder' });
  }
};

// Get all folders (optionally by parentId)
exports.getFolders = async (req, res) => {
  const userId = req.user.id;
  const { parentId = null } = req.query;

  try {
    const folders = await Folder.findAll({
      where: {
        userId,
        parentId: parentId === null ? null : parentId,
      },
    });

    res.status(200).json({ folders });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to get folders' });
  }
};

// Delete folder (can combine with recursive logic later)
exports.deleteFolder = async (req, res) => {
  const folderId = req.params.id;
  const userId = req.user.id;

  try {
    const folder = await Folder.findOne({ where: { id: folderId, userId } });

    if (!folder) {
      return res.status(404).json({ message: 'Folder not found' });
    }

    await folder.destroy();

    res.status(200).json({ message: 'Folder deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete folder' });
  }
};
// Update folder (name or parentId)
exports.updateFolder = async (req, res) => {
    const folderId = req.params.id;
    const userId = req.user.id;
    const { name, parentId } = req.body;
  
    try {
      const folder = await Folder.findOne({ where: { id: folderId, userId } });
  
      if (!folder) {
        return res.status(404).json({ message: 'Folder not found' });
      }
  
      // Prevent moving a folder inside itself or its children
      if (parentId && parseInt(parentId) === parseInt(folderId)) {
        return res.status(400).json({ message: 'A folder cannot be its own parent.' });
      }
  
      if (parentId) {
        const parent = await Folder.findOne({ where: { id: parentId, userId } });
        if (!parent) {
          return res.status(400).json({ message: 'Parent folder not found or not owned by user' });
        }
      }
  
      folder.name = name || folder.name;
      folder.parentId = parentId !== undefined ? parentId : folder.parentId;
  
      await folder.save();
  
      res.status(200).json({ message: 'Folder updated successfully', folder });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to update folder' });
    }
  };
  