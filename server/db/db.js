const Sequelize = require('sequelize');

const dbPath = '../brb-overlay-game.db';

const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: dbPath,
    logging: false
  });

module.exports.db = sequelize;
