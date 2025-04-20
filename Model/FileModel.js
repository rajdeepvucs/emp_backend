
const { DataTypes } = require('sequelize');
const sequelize = require('../db'); 
const fs = require('fs');
const path = require('path');

const File = sequelize.define('File', {
    id: {                     
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    name: {                  
        type: DataTypes.STRING,
        allowNull: false,
    },
    path: {               
        type: DataTypes.STRING,
        allowNull: false,
          
    },
    type: {                 
        type: DataTypes.STRING,
        allowNull: true,   
    },
    size: {                
        type: DataTypes.INTEGER,
        allowNull: true,    
    },
    
    folderId: {
        type: DataTypes.INTEGER,
        allowNull: false, 
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false, 
    },
}, {
    tableName: 'files', 
    timestamps: true,     
    hooks: {
         
         afterDestroy: async (file, options) => {
             if (file.path && fs.existsSync(path.resolve(file.path))) { 
                 try {
                    await fs.promises.unlink(path.resolve(file.path));
                    console.log(`Successfully deleted physical file: ${file.path}`);
                 } catch (err) {
                     console.error(`Error deleting physical file ${file.path}:`, err);
                     
                 }
             } else if (file.path) {
                 console.warn(`Physical file not found for deletion: ${file.path}`);
             }
         }
    },
    indexes: [
        { fields: ['userId'] },
        { fields: ['folderId'] },
    ]
});

module.exports = File;