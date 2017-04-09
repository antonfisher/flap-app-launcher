const electron = require('electron')
const {app, globalShortcut, ipcMain: ipc} = electron;

const LinuxDriver = require('./src/drivers/linux.js');
const {createWindow} = require('./src/window.js');
const ipcCommands = require('./src/ipcCommands.js');
const logger = require('./src/logger.js');
const statistics = require('./src/statistics.js');

logger.info('Start application');

require('electron-reload')(__dirname);

const DEFAULT_START_HOTKEYS = 'Super+Space';

let wnd;
let driver;

// 'darwin', 'freebsd', 'linux', 'sunos' or 'win32'
if (process.platform === 'linux') {
  driver = new LinuxDriver();
} else {
  console.log(`ERROR: platform ${process.platform} is not supported.\nPlease send request to a.fschr@gmail.com.`);
  process.exit(1);
}

app.on('ready', () => {
  driver.getApplicationList()
    .then((applications) => {
      global.applicationList = statistics.sortCommands(applications);
      console.log('Total applications found:', global.applicationList.length);
      //applications.forEach((a) => {console.log('-- app:', a.path + ' >>> ' + a.command)});
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
        if (!command) {
          return;
        }
        logger.info('Run command:', command.path);
        driver.runApplication(command, (result) => {
          logger.info('`- result for:', command.path, '-', result);
          event.sender.send(ipcCommands.RUN_COMMAND_OK, result);
          statistics.addStatRecord(command.path);
          if (result) {
            wnd.hide();
          }
        });
      });
    })
    .catch((err) => {
      logger.info('Error:', err);
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
