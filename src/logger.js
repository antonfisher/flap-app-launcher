const path = require('path');
const {homedir} = require('os');
const {Logger, transports: {Console, File}} = require('winston');

const LOG_FILE_NAME = '.flap-app-launcher.log';
const LOG_FILE_PATH = (
  process.env.NODE_ENV === 'production'
    ? path.join(homedir(), LOG_FILE_NAME)
    : path.join(__dirname, '..', LOG_FILE_NAME)
);

const logger = new Logger({
  transports: [
    new Console(),
    new File({filename: LOG_FILE_PATH, json: false})
  ]
});

logger.info(`Application logs file: ${LOG_FILE_PATH}`);

module.exports = logger;
