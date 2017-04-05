const url = require('url');
const path = require('path');
const electron = require('electron');
const {BrowserWindow} = electron;

const WINDOW_WIDTH = 500;
const WINDOW_HEIGHT = 30;

module.exports = {
  WINDOW_WIDTH,
  WINDOW_HEIGHT,
  createWindow() {
    const {width, height} = electron.screen.getPrimaryDisplay().workAreaSize;
    const x = ((width - WINDOW_WIDTH) / 2);
    const y = ((height - WINDOW_HEIGHT) / 2);

    const wnd = new BrowserWindow({
      x,
      y,
      width: WINDOW_WIDTH,
      height: WINDOW_HEIGHT,
      center: false,
      frame: false,
      transparent: true,
      darkTheme: true,
      resizable: false,
      titleBarStyle: 'hidden',
      skipTaskbar: true,
      //show: false,
      alwaysOnTop: true,
      defaultFontFamily: 'monospace, "Ubuntu Mono", "Courier New"'
    });

    wnd.loadURL(url.format({
      pathname: path.join(__dirname, 'window/index.html'),
      protocol: 'file:',
      slashes: true
    }));

    //wnd.webContents.openDevTools();

    return wnd;
  }
}
