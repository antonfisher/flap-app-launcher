const url = require('url')
const path = require('path')
const {BrowserWindow} = require('electron')

module.exports = {
  createWindow() {
    let wnd = new BrowserWindow({
      width: 500,
      height: 30,
      frame: false,
      //transparent: true,
      resizable: false,
      titleBarStyle: 'hidden',
      skipTaskbar: true,
      //show: false,
      alwaysOnTop: true,
      defaultFontFamily: 'monospace'
    })

    wnd.loadURL(url.format({
      pathname: path.join(__dirname, 'window/index.html'),
      protocol: 'file:',
      slashes: true
    }))

    //wnd.webContents.openDevTools()

    return wnd
  }
}