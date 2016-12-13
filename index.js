const {app, BrowserWindow, globalShortcut, ipcMain: ipc} = require('electron')
const path = require('path')
const url = require('url')
const exec = require('child_process').exec

require('electron-reload')(__dirname)

let mainWindow

function createWindow () {
  mainWindow = new BrowserWindow({
    width: 500,
    height: 30,
    // width: 900,
    // height: 500,
    frame: false,
    //transparent: true,
    resizable: false,
    titleBarStyle: 'hidden',
    //skipTaskbar: true,
    //show: false
  })

  mainWindow.loadURL(url.format({
    pathname: path.join(__dirname, 'index.html'),
    protocol: 'file:',
    slashes: true
  }))

  mainWindow.webContents.openDevTools()

  mainWindow.on('close', () => {
    mainWindow = null
  })

  globalShortcut.register('Super+K', function () {
    mainWindow.show()
  })

  // exec('chrome', function(error, stdout, stderr) {
  //   // command output is in stdout
  // });

  ipc.on('run-command', function (event, data) {
    console.log('-- ipc main', data);
    const path = data.path
    exec(path, function () {
      console.log('-- done:', path);
    })
    event.sender.send('run-command-ok', true);
    mainWindow.hide()
  })

  ipc.on('hide', function (event) {
    console.log('-- ipc hide');
    event.sender.send('hide-ok', true);
    mainWindow.hide()
  })
}

app.on('ready', createWindow)

app.on('will-quit', function () {
  globalShortcut.unregisterAll()
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow()
  }
})
