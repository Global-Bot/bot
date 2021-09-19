const { init, Logger } = require('@global-bot/logger');
const config = require('./config');

init(config.logger);

module.exports = Logger;
