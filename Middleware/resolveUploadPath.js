// backend/middleware/uploadMiddleware.js (or similar)

const multer = require('multer');
const path = require('path');
const fs = require('fs');
const User = require('../Model/UserModel');
const  Folder = require('../Model/FolderModel'); // <-- Import User and Folder models

// --- Configuration ---
const BASE_UPLOADS_PATH = process.env.UPLOADS_DIR || path.join(__dirname, '..', 'uploads');

// --- Helper: Sanitize Name for Filesystem ---
const sanitizeForPath = (name) => {
    if (!name || typeof name !== 'string') return '_invalid_name_';
    const sanitized = name.replace(/[\/\\?%*:|"<>]/g, '_').trim();
    return sanitized.replace(/^\.+|\.+$/g, '').trim() || '_empty_name_';
};

// --- Multer Storage Configuration ---
const storage = multer.diskStorage({
    destination: async (req, file, cb) => {
        // This function now resolves the path dynamically
        try {
            const userId = req.user?.id; // Assumes auth middleware ran before Multer
            if (!userId) {
                return cb(new Error("User authentication required."));
            }

            // *** Read folderId from req.body ***
            const folderIdInput = req.body.folderId;
            console.log("first",folderIdInput)
            console.log("userId",userId)
            const isRootUpload = (!folderIdInput || ['null', 'undefined', '0'].includes(folderIdInput)); // Assuming '0', null, undefined mean root

            let targetFolderName = 'root'; // Default directory name for root

            // --- Fetch User Name ---
            const user = await User.findByPk(userId, { attributes: ['name'] });
            if (!user || !user.name) {
                 // Handle user not found, though unlikely if auth passed
                 console.error(`User not found for ID: ${userId}`);
                 return cb(new Error(`User with ID ${userId} not found.`));
            }
            // Use username in path IF DESIRED (causes issues with name changes)
            // const sanitizedUsername = sanitizeForPath(user.name);
            // For simplicity and robustness, usually just use userId:
            const userDirSegment = user.name.toString();

            // --- Fetch Folder Name (if not root) ---
            if (!isRootUpload) {
                const folderId = parseInt(folderIdInput, 10);
                if (!isNaN(folderId)) {
                    const folder = await Folder.findOne({
                        where: { id: folderId, userId: userId }, // Check ownership
                        attributes: ['name']
                    });

                    if (folder && folder.name) {
                        targetFolderName = sanitizeForPath(folder.name);
                    } else {
                        console.warn(`Target folder ID ${folderId} not found/owned by user ${userId}. Using 'root'.`);
                        targetFolderName = 'root'; // Fallback or throw error
                        // return cb(new Error(`Target folder ${folderId} not found or access denied.`));
                    }
                } else {
                     console.warn(`Invalid folder ID format: ${folderIdInput}. Using 'root'.`);
                     targetFolderName = 'root';
                     // return cb(new Error(`Invalid folder ID format: ${folderIdInput}`));
                }
            } else {
                 console.log(`folderId is '${folderIdInput}', treating as root folder.`);
                 targetFolderName = 'root';
            }

            // Construct the final path using User ID and sanitized Folder Name
            // Example: /uploads/123/My_Documents/
            const finalPath = path.join(BASE_UPLOADS_PATH, userDirSegment, targetFolderName);

            // Ensure directory exists
            await fs.promises.mkdir(finalPath, { recursive: true });
            console.log(`Multer destination resolved to: ${finalPath}`);
            cb(null, finalPath); // Tell Multer where to save

        } catch (error) {
            console.error("Error resolving Multer destination:", error);
            cb(error); // Pass error to Multer
        }
    },
    filename: (req, file, cb) => {
        // Keep unique filenames within the target folder
        const safeOriginalName = file.originalname.replace(/[\s\/\\?%*:|"<>]/g, '_'); // Basic sanitize
        cb(null, `${Date.now()}-${safeOriginalName}`);
    }
});

// Configure Multer
const upload = multer({
    storage: storage,
    // limits: { fileSize: ... }, // Add limits if needed
});

// Export the middleware ready to use in routes
module.exports = {
    uploadMiddleware: upload.single('file')
};