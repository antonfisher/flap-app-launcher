const {globalShortcut, ipcMain: ipc} = require('electron');
const window = require('./window');
const logger = require('./logger');
const configs = require('./configs');
const statistics = require('./statistics');
const ipcCommands = require('./ipcCommands');

const WINDOW_WIDTH = 500;
const WINDOW_HEIGHT = 30;

class Application {
  constructor(driver) {
    this.driver = driver;
    this.config = {};
    this.mainWindow = null;
  }

  run() {
    configs.loadConfig()
      .then(loadedConfig => this.saveConfig(loadedConfig))
      .then(() => Promise.all([this.driver.getApplicationList(), statistics.loadStats()]))
      .then(([applications, stats]) => this.combineAppsAndStats(applications, stats))
      .then(applications => statistics.sortCommands(applications))
      .then(applications => this.saveApplicationList(applications))
      .then(() => this.createMainWindow())
      .catch(err => logger.error('Cannot run application', err));
  }

  saveConfig(loadedConfig) {
    this.config = loadedConfig;
    logger.info('Application config:');
    logger.info(` - hotkey binding: ${this.config.hotkey}`);
  }

  combineAppsAndStats(applications, stats) {
    const applicationsMap = applications.reduce((acc, item) => {
      acc[item.path] = item;
      return acc;
    }, {});
    Object.keys(stats).forEach((path) => {
      if (!applicationsMap[path]) {
        applications.push({
          rawPath: path,
          command: path
        });
      }
    });
    return applications;
  }

  saveApplicationList(applications) {
    global.applicationList = applications;
    logger.info(`Total applications found: ${applications.length}`);
  }

  createMainWindow() {
    this.mainWindow = window.create(window.TYPE_MAIN, WINDOW_WIDTH, WINDOW_HEIGHT);

    globalShortcut.register(this.config.hotkey, () => {
      this.mainWindow.setSkipTaskbar(true);
      this.mainWindow.setAlwaysOnTop(true);
      this.mainWindow.show();
      this.mainWindow.focus();
    });

    this.mainWindow.on('blur', () => this.mainWindow.hide());
    this.mainWindow.on('close', () => (this.mainWindow = null));

    ipc.on(ipcCommands.HIDE, () => this.mainWindow.hide());
    ipc.on(ipcCommands.RUN_COMMAND, (event, command) => {
      logger.info(`Run command: "${command.path || command.rawPath}"...`);
      this.driver.runApplication(command, (result) => {
        logger.info(`     result: "${command.path || command.rawPath}" is ${result ? 'OK' : 'FAIL'}`);
        if (result) {
          this.mainWindow.hide();
        }
        event.sender.send(ipcCommands.RUN_COMMAND_DONE, result);
        statistics.addRecord(command.path || command.rawPath);
        //sort applications list again
      });
    });
  }
}

module.exports = Application;
