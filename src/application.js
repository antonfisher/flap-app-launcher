const {globalShortcut, ipcMain: ipc} = require('electron');
const logger = require('./logger');
const configs = require('./configs');
const windows = require('./windows');
const statistics = require('./statistics');
const ipcCommands = require('./ipcCommands');
const {version} = require('../package.json');

class Application {
  constructor(driver) {
    this.driver = driver;
    this.mainWindow = null;
    global.version = version;
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
    global.config = loadedConfig;
    logger.info('Application config:');
    logger.info(` - hotkey binding: ${global.config.hotkey}`);
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
    logger.verbose('Creating main window..');
    this.mainWindow = windows.createMainWindow();

    globalShortcut.register(global.config.hotkey, () => {
      this.mainWindow.setSkipTaskbar(true);
      this.mainWindow.setAlwaysOnTop(true);
      this.mainWindow.show();
      this.mainWindow.focus();
    });

    this.mainWindow.on('close', () => (this.mainWindow = null));
    this.mainWindow.on('blur', () => {
      if (!this.settingsWindow) {
        this.mainWindow.hide();
      }
    });

    ipc.on(ipcCommands.HIDE, () => this.mainWindow.hide());
    ipc.on(ipcCommands.OPEN_SETTINGS_WINDOW, () => this.createSettingsWindow());
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

  createSettingsWindow() {
    logger.verbose('Creating settings window..');
    this.settingsWindow = windows.createSettingsWindow();

    ipc.on(ipcCommands.CLOSE, () => this.settingsWindow.close());
    this.settingsWindow.on('close', () => (this.settingsWindow = null));
  }
}

module.exports = Application;
