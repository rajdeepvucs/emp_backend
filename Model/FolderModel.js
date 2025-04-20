
const { DataTypes } = require('sequelize');
const sequelize = require('../db'); 
const Folder = sequelize.define('Folder', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    
    parentId: {
        type: DataTypes.INTEGER,
        allowNull: true, },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
}, {
    tableName: 'folders',
    timestamps: true,
    // Optional: Add indexes for faster lookups
    indexes: [
        { fields: ['userId'] },
        { fields: ['parentId'] },
    ]
});

module.exports = Folder;