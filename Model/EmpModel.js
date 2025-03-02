const { DataTypes } = require('sequelize');
const sequelize = require("../db"); // adjust the path to your database config

const Emp = sequelize.define('Emp', {
 name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
email: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  phoneNumber: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },

  role: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      isIn: [["Developer" , "Designer" , "Manager"]], 
    },
  },
  joiningDate: {
    type: DataTypes.DATE,
    allowNull: true,
  },
 

}, {
  timestamps: true, 
  tableName: 'empdatas',

});

module.exports = Emp;