const {app, BrowserWindow, globalShortcut, ipcMain: ipc} = require('electron')
const path = require('path')
const url = require('url')
//const exec = require('child_process').exec

require('electron-reload')(__dirname)

let mainWindow

function createWindow () {
  mainWindow = new BrowserWindow({
    // width: 500,
    // height: 50,
    width: 900,
    height: 500,
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

  // globalShortcut.register('CommandOrControl+K', function () {
  //   mainWindow.show()
  // })

  // exec('chrome', function(error, stdout, stderr) {
  //   // command output is in stdout
  // });

  ipc.on('invokeAction', function (event, data) {
    console.log('-- ipc main', data);
    event.sender.send('actionReply', 'ok');
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
