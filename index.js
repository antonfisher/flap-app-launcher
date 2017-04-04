const {app, globalShortcut, ipcMain: ipc} = require('electron');

const LinuxDriver = require('./src/drivers/linux.js');
const createWindow = require('./src/window.js').createWindow;
const ipcCommands = require('./src/ipcCommands.js');

require('electron-reload')(__dirname);

const DEFAULT_START_HOTKEYS = 'Super+k';

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
  driver.getApplicationsList()
    .then((applications) => {
      global.applicationsList = applications;
      console.log('Total applications found:', global.applicationsList.length);
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
        console.log('-- runApplication', command.path);
        driver.runApplication(command, (result) => {
          event.sender.send(ipcCommands.RUN_COMMAND_OK, result);
          if (result) {
            wnd.hide();
          }
        });
      });
    })
    .catch((err) => {
      console.log('ERROR:', err);
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
