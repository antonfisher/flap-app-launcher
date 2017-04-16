const path = require('path');
const winston = require('winston');

const LOG_FILE_NAME = 'flap-app-launcher.log';
const LOG_FILE_PATH = path.join(__dirname, '..', LOG_FILE_NAME);

const logger = new (winston.Logger)({
  transports: [
    new (winston.transports.Console)(),
    new (winston.transports.File)({
      filename: LOG_FILE_PATH,
      json: false
    })
  ]
});

logger.info(`Application logs file "${LOG_FILE_PATH}"`);

module.exports = logger;
