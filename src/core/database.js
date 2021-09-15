const globalDatabase = require('@global-bot/database');
const config = require('./config');
const logger = require('./logger');

const db = new globalDatabase(Object.assign(config, {
    logger: logger.get('DataBase')
}));

module.exports = db;
