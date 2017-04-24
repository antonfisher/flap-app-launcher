const url = require('url');
const path = require('path');
const electron = require('electron');
const mainWindowDefaultConfig = require('./windows/main/config');
const settingsWindowDefaultConfig = require('./windows/settings/config');

const {BrowserWindow} = electron;

const DEFAULT_WINDOW_CONFIG = {
  center: false,
  darkTheme: true,
  defaultFontFamily: 'monospace, "Ubuntu Mono", "Courier New"',
  webPreferences: {
    //devTools: true
  }
};

function create(pathToIndex, config) {
  const {width, height} = electron.screen.getPrimaryDisplay().workAreaSize;
  const x = ((width - config.width) / 2);
  const y = ((height - config.height) / 2);

  const wnd = new BrowserWindow(Object.assign({x, y}, DEFAULT_WINDOW_CONFIG, config));

  wnd.loadURL(url.format({
    pathname: pathToIndex,
    protocol: 'file:',
    slashes: true
  }));

  wnd.setMenu(null);

  //wnd.webContents.openDevTools();

  return wnd;
}

function createMainWindow(config) {
  const pathToIndex = path.join(__dirname, 'windows/main/index.html');
  return create(pathToIndex, Object.assign({}, mainWindowDefaultConfig, config));
}

function createSettingsWindow(config) {
  const pathToIndex = path.join(__dirname, 'windows/settings/index.html');
  return create(pathToIndex, Object.assign({}, settingsWindowDefaultConfig, config));
}

module.exports = {
  create,
  createMainWindow,
  createSettingsWindow
};
