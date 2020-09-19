const Sequelize = require('sequelize');
const { db } = require("./db");

const enemiesDB = db.define('enemies', {
    username: {
        type: Sequelize.STRING,
        allowNull: true
    },
    enemyType: {
        type: Sequelize.STRING,
        allowNull: true
    },
    level: {
        type: Sequelize.INTEGER,
        allowNull: true
    },
    health: {
        type: Sequelize.INTEGER,
        allowNull: true
    },
    attack: {
        type: Sequelize.INTEGER,
        allowNull: true
    },
    def: {
        type: Sequelize.INTEGER,
        allowNull: true
    },
    class: {
        type: Sequelize.INTEGER,
        allowNull: true
    }
}, {
    // sequelize options
});

module.exports.enemiesDB = enemiesDB;

