const path = require('path');
const winston = require('winston');

const LOG_FILE = 'flap-app-launcher.log';

const logger = new (winston.Logger)({
  transports: [
    new (winston.transports.Console)(),
    new (winston.transports.File)({
      filename: path.join(__dirname, '..', LOG_FILE),
      json: false
    })
  ]
});

module.exports = logger;
