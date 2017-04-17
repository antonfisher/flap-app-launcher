const path = require('path');
const {homedir} = require('os');
const winston = require('winston');

const LOG_FILE_NAME = '.flap-app-launcher.log';
const LOG_FILE_PATH = (
  process.env.NODE_ENV === 'production'
    ? path.join(homedir(), LOG_FILE_NAME)
    : path.join(__dirname, '..', LOG_FILE_NAME)
);

const transports = [
  new (winston.transports.Console)()
];

if (process.env.NODE_ENV !== 'test') {
  transports.push(
    new (winston.transports.File)({
      filename: LOG_FILE_PATH,
      json: false
    })
  );
}

const logger = new (winston.Logger)({transports});

logger.info(`Application logs file "${LOG_FILE_PATH}"`);

module.exports = logger;
