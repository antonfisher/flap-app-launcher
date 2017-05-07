const url = require('url');
const path = require('path');
const electron = require('electron');
const mainWindowDefaultConfig = require('./windows/main/config');
const settingsWindowDefaultConfig = require('./windows/settings/config');

const {BrowserWindow} = electron;

const DEFAULT_WINDOW_CONFIG = {
  center: false,
  darkTheme: true,
  defaultFontFamily: '"Ubuntu Mono", "Courier New", monospace',
  webPreferences: {
    devTools: false
  }
};

function create(pathToIndex, config) {
  const {width, height} = electron.screen.getPrimaryDisplay().workAreaSize;
  const x = ((width - config.width) / 2);
  const y = ((height - config.height) / 2);
  const fullConfig = Object.assign({x, y}, DEFAULT_WINDOW_CONFIG, config);

  const wnd = new BrowserWindow(fullConfig);

  wnd.loadURL(url.format({
    pathname: pathToIndex,
    protocol: 'file:',
    slashes: true
  }));

  wnd.setMenu(null);

  if (fullConfig.webPreferences.devTools) {
    wnd.webContents.openDevTools();
  }

  wnd.setWidth = function setWidth(newWidth) {
    wnd.setSize(newWidth, config.height);
    wnd.setPosition(((width - newWidth) / 2), y);
  };

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
