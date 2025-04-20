const fs = require('fs');
const path = require('path');
const Folder = require('../Model/FolderModel');

const BASE_PATH = path.join(__dirname, '..', 'uploads');


function deleteFolderRecursive(folderPath) {
  if (fs.existsSync(folderPath)) {
    fs.readdirSync(folderPath).forEach(file => {
      const curPath = path.join(folderPath, file);
      if (fs.lstatSync(curPath).isDirectory()) {
        deleteFolderRecursive(curPath);
      } else {
        fs.unlinkSync(curPath);
      }
    });
    fs.rmdirSync(folderPath);
  }
}

exports.createFolder = async (req, res) => {
  const { name, parentId } = req.body;
  const userId = req.user.id;

  try {
    let parentFolder = null;

    if (parentId) {
      parentFolder = await Folder.findOne({ where: { id: parentId, userId } });
      if (!parentFolder) {
        return res.status(404).json({ message: 'Parent folder not found or not owned by user.' });
      }
    }

    const folder = await Folder.create({
      name,
      parentId: parentId || null,
      userId,
    });

    // Create physical folder
    const folderPath = parentFolder
      ? path.join(BASE_PATH, parentFolder.name, name)
      : path.join(BASE_PATH, name);

    fs.mkdirSync(folderPath, { recursive: true });

    res.status(201).json({ message: 'Folder created successfully', folder });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create folder' });
  }
};

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

exports.deleteFolder = async (req, res) => {
  const folderId = req.params.id;
  const userId = req.user.id;

  try {
    const folder = await Folder.findOne({ where: { id: folderId, userId } });
    if (!folder) return res.status(404).json({ message: 'Folder not found' });

    
    const parentFolder = folder.parentId
      ? await Folder.findOne({ where: { id: folder.parentId, userId } })
      : null;

    const folderPath = parentFolder
      ? path.join(BASE_PATH, parentFolder.name, folder.name)
      : path.join(BASE_PATH, folder.name);

    deleteFolderRecursive(folderPath);

    await folder.destroy();

    res.status(200).json({ message: 'Folder deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete folder' });
  }
};

exports.updateFolder = async (req, res) => {
  const folderId = req.params.id;
  const userId = req.user.id;
  const { name, parentId } = req.body;

  try {
    const folder = await Folder.findOne({ where: { id: folderId, userId } });
    if (!folder) return res.status(404).json({ message: 'Folder not found' });

    if (parentId && parseInt(parentId) === parseInt(folderId)) {
      return res.status(400).json({ message: 'A folder cannot be its own parent.' });
    }

    let parentFolder = null;
    if (parentId) {
      parentFolder = await Folder.findOne({ where: { id: parentId, userId } });
      if (!parentFolder) {
        return res.status(400).json({ message: 'Parent folder not found or not owned by user' });
      }
    }

    // Rename physical folder
    const oldFolderPath = folder.parentId
      ? path.join(BASE_PATH, (await Folder.findOne({ where: { id: folder.parentId, userId } })).name, folder.name)
      : path.join(BASE_PATH, folder.name);

    const newFolderPath = parentFolder
      ? path.join(BASE_PATH, parentFolder.name, name)
      : path.join(BASE_PATH, name);

    if (fs.existsSync(oldFolderPath)) {
      fs.renameSync(oldFolderPath, newFolderPath);
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
