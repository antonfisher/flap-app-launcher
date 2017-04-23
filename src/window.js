const url = require('url');
const path = require('path');
const electron = require('electron');

const {BrowserWindow} = electron;
const TYPE_MAIN = 'main';
const TYPE_OPTIONS = 'options';

module.exports = {
  TYPE_MAIN,
  TYPE_OPTIONS,
  create(type, windowWidth, windowHeight) {
    const {width, height} = electron.screen.getPrimaryDisplay().workAreaSize;
    const x = ((width - windowWidth) / 2);
    const y = ((height - windowHeight) / 2);

    const wnd = new BrowserWindow({
      x,
      y,
      width: windowWidth,
      height: windowHeight,
      center: false,
      frame: false,
      transparent: false,
      darkTheme: true,
      resizable: false,
      titleBarStyle: 'hidden',
      skipTaskbar: true,
      // show: false,
      alwaysOnTop: true,
      defaultFontFamily: 'monospace, "Ubuntu Mono", "Courier New"',
      backgroundColor: '#f333'
    });

    wnd.loadURL(url.format({
      pathname: path.join(__dirname, `${type}Window/index.html`),
      protocol: 'file:',
      slashes: true
    }));

    //wnd.webContents.openDevTools();

    return wnd;
  }
};
