process.env.NODE_ENV = (process.env.NODE_ENV || 'production');

const electron = require('electron');
const LinuxDriver = require('./src/drivers/linux.js');
const {createWindow} = require('./src/window.js');
const ipcCommands = require('./src/ipcCommands.js');
const logger = require('./src/logger.js');
const statistics = require('./src/statistics.js');

const {app, globalShortcut, ipcMain: ipc} = electron;
const DEFAULT_START_HOTKEYS = 'Super+Space';

let wnd;
let driver;

logger.info(`Start application, mode: ${process.env.NODE_ENV}`);
logger.info(`HotKey binding: ${DEFAULT_START_HOTKEYS}`);

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
    statistics.loadStats()
  ])
    .then(([applications, stats]) => {
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
      globalShortcut.register(DEFAULT_START_HOTKEYS, () => {
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
