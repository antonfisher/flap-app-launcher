const path = require('path');
const {homedir} = require('os');
const {createLogger, format, transports} = require('winston');

const LOG_FILE_NAME = '.flap-app-launcher.log';
const LOG_FILE_PATH =
  process.env.NODE_ENV === 'production'
    ? path.join(homedir(), LOG_FILE_NAME)
    : path.join(__dirname, '..', LOG_FILE_NAME);

const transportConsole = new transports.Console({
  level: 'debug'
});
const transportFile = new transports.File({
  level: 'info',
  filename: LOG_FILE_PATH,
  tailable: true,
  maxsize: 10 * 1024 * 1024,
  maxFiles: 10
});

const logger = createLogger({
  level: 'info',
  format: format.combine(
    format.colorize(),
    format.timestamp({
      format: 'YYYY-MM-DD HH:mm:ss'
    }),
    format.printf((info) => `${info.timestamp} ${info.level}: ${info.message}`),
    format.errors({stack: true})
  ),
  transports: [transportConsole, transportFile],
  exceptionHandlers: [transportConsole, transportFile]
});

logger.info(`Application logs file: ${LOG_FILE_PATH}`);

module.exports = logger;
