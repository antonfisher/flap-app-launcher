process.env.NODE_ENV = (process.env.NODE_ENV || 'production');

const electron = require('electron');
const LinuxDriver = require('./src/drivers/linux.js');
const {createWindow} = require('./src/window.js');
const ipcCommands = require('./src/ipcCommands.js');
const logger = require('./src/logger.js');
const statistics = require('./src/statistics.js');
const configs = require('./src/configs.js');

const {app, globalShortcut, ipcMain: ipc} = electron;

let wnd;
let driver;
let config;

logger.info(`Start application, mode: ${process.env.NODE_ENV}`);

// 'darwin', 'freebsd', 'linux', 'sunos' or 'win32'
if (process.platform === 'linux') {
  driver = new LinuxDriver();
} else {
  logger.error(`ERROR: platform ${process.platform} is not supported.\nPlease send request to a.fschr@gmail.com.`);
  process.exit(1);
}

app.on('ready', () => {
  Promise.all([
    driver.getApplicationList(),
    statistics.loadStats(),
    configs.loadConfig()
  ])
    .then(([applications, stats, loadedConfig]) => {
      config = loadedConfig;
      logger.info('Application config:');
      logger.info(` - hotKey binding: ${config.hotkey}`);

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
    })
    .then(statistics.sortCommands)
    .then((applications) => {
      global.applicationList = applications;
      logger.info(`Total applications found: ${applications.length}`);
    })
    .then(() => {
      wnd = createWindow();
    })
    .then(() => {
      globalShortcut.register(config.hotkey, () => {
        wnd.setSkipTaskbar(true);
        wnd.setAlwaysOnTop(true);
        wnd.show();
        wnd.focus();
      });

      ipc.on(ipcCommands.HIDE, () => {
        wnd.hide();
      });

      wnd.on('blur', () => {
        wnd.hide();
      });

      wnd.on('close', () => {
        wnd = null;
      });

      ipc.on(ipcCommands.RUN_COMMAND, (event, command) => {
        logger.info(`Run command: "${command.path || command.rawPath}"...`);
        driver.runApplication(command, (result) => {
          logger.info(`     result: "${command.path || command.rawPath}" is ${result ? 'OK' : 'FAIL'}`);
          if (result) {
            wnd.hide();
          }
          event.sender.send(ipcCommands.RUN_COMMAND_DONE, result);
          statistics.addRecord(command.path || command.rawPath);
          //sort applications list again
        });
      });
    })
    .catch((err) => {
      logger.info(`Error: ${err}`);
    });
});

app.on('will-quit', () => {
  globalShortcut.unregisterAll();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (wnd === null) {
    wnd = createWindow();
  }
});
