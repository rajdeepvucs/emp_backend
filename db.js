const { Sequelize } = require('sequelize');

// Database connection details
const database = 'emp'; 
const username = 'root'; 
const password = ''; 
const host = 'localhost';
const dialect = 'mysql';

// Create a new Sequelize instance
const sequelize = new Sequelize(database, username, password, {
    host: host,
    dialect: dialect,
    logging: false, // Disable logging; default: console.log
    // pool configuration used to pool database connections
    pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000
    }
});

// Test the database connection
(async () => {
    try {
        await sequelize.authenticate();
        console.log('Connection has been established successfully.');
    } catch (error) {
        console.error('Unable to connect to the database:', error);
    }
})();

// Export the Sequelize instance for use in other parts of the app
module.exports = sequelize;
