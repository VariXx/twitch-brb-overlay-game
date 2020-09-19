const Sequelize = require('sequelize');
const { db } = require("./db");

const playersDB = db.define('players', {
    username: {
        type: Sequelize.STRING,
        allowNull: true
    },
    twitchID: {
        type: Sequelize.STRING,
        allowNull: true
    },
    level: {
        type: Sequelize.INTEGER,
        allowNull: true
    },
    xp: {
        type: Sequelize.INTEGER,
        allowNull: true
    },
    health: {
        type: Sequelize.INTEGER,
        allowNull: true
    }
}, {
    // sequelize options
});

module.exports.playersDB = playersDB;

