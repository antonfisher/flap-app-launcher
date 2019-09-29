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
    this.settingsWindow = null;
    global.version = version;
  }

  run() {
    configs
      .loadConfig()
      .then((loadedConfig) => this.saveConfig(loadedConfig))
      .then(() => Promise.all([this.driver.getApplicationList(), statistics.loadStats()]))
      .then(([applications, stats]) => this.combineAppsAndStats(applications, stats))
      .then((applications) => statistics.sortCommands(applications))
      .then((applications) => this.saveApplicationList(applications))
      .then(() => this.registerShortcut())
      .then(() => this.bindIpc())
      .then(() => this.createMainWindow())
      .catch((err) => logger.error('Application error:', err));
  }

  saveConfig(loadedConfig) {
    global.config = loadedConfig;
    logger.info('Application config:');
    logger.info(` - input width: ${global.config.width}`);
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

  registerShortcut() {
    logger.verbose('Register hotkey:', global.config.hotkey);
    globalShortcut.unregisterAll();
    globalShortcut.register(global.config.hotkey, () => {
      if (this.mainWindow) {
        this.mainWindow.setSkipTaskbar(true);
        this.mainWindow.setAlwaysOnTop(true);
        this.mainWindow.show();
        this.mainWindow.focus();
      }
    });
  }

  bindIpc() {
    //main window
    ipc.on(ipcCommands.HIDE_MAIN_WINDOW, () => this.mainWindow.hide());
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

    //settings window
    ipc.on(ipcCommands.UPDATE_SETTINGS, (event, changedByUserConfig) => {
      logger.verbose('Save new config:', changedByUserConfig);
      configs
        .saveConfig(changedByUserConfig)
        .then((newConfig) => {
          this.saveConfig(newConfig);
          if (this.mainWindow) {
            this.mainWindow.setWidth(global.config.width);
          }
          this.registerShortcut();
          event.sender.send(ipcCommands.SETTINGS_UPDATED);
        })
        .catch((e) => {
          logger.error('Cannot save config:', e);
        });
    });

    ipc.on(ipcCommands.CLOSE_SETTINGS_WINDOW, () => {
      this.settingsWindow.close();
    });
  }

  createMainWindow() {
    logger.verbose('Creating main window..');
    this.mainWindow = windows.createMainWindow({
      width: global.config.width
    });

    this.mainWindow.on('blur', () => {
      if (!this.settingsWindow) {
        this.mainWindow.hide();
      }
    });
  }

  createSettingsWindow() {
    logger.verbose('Creating settings window..');
    this.settingsWindow = windows.createSettingsWindow();
    this.settingsWindow.on('close', () => {
      this.settingsWindow = null;
    });
  }
}

module.exports = Application;
