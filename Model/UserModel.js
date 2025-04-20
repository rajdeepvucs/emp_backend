
const { DataTypes } = require('sequelize');
const sequelize = require('../db'); 
const bcrypt = require('bcryptjs');

const User = sequelize.define('User', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
      
        validate: {
            isEmail: true,
        },
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false,
    },
}, {
    tableName: 'users', 
    timestamps: true,   
    hooks: {
        beforeCreate: async (user) => {
            if (user.password) {
               
                user.password = await bcrypt.hash(user.password, 10);
            }
            if (user.name) {
                user.name = user.name.toUpperCase(); 
            }
        },
        beforeUpdate: async (user) => {
            if (user.changed('password')) {
                
                user.password = await bcrypt.hash(user.password, 10);
            }
        }
    }
});


User.prototype.isValidPassword = async function(password) {
    return await bcrypt.compare(password, this.password);
};

module.exports = User;