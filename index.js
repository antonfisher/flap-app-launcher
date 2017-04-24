process.env.NODE_ENV = (process.env.NODE_ENV || 'production');

const electron = require('electron');
const logger = require('./src/logger');
const {version} = require('./package.json');
const Application = require('./src/application');
const LinuxDriver = require('./src/drivers/linux');

const {app, globalShortcut} = electron;

logger.info(`Start application v${version}, mode: ${process.env.NODE_ENV}, platform: ${process.platform}`);

process.on('uncaughtException', (error) => {
  try {
    logger.error(error);
  } catch (e) {
    process.stdout.write(`EXCEPTION: ${error}, CATCH EXCEPTION: ${e}`);
  }
});

// 'darwin', 'freebsd', 'linux', 'sunos' or 'win32'
let driver;
if (process.platform === 'linux') {
  driver = new LinuxDriver();
} else {
  logger.error(`platform ${process.platform} is not supported.\nPlease send request to a.fschr@gmail.com.`);
  process.exit(1);
}

const application = new Application(driver);

app.on('ready', () => application.run());
app.on('will-quit', () => globalShortcut.unregisterAll());
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
