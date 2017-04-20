const fs = require('fs');
const path = require('path');
const {homedir} = require('os');
const logger = require('./logger');

const DEFAULT_CONFIG = {
  hotkey: 'Super+Space'
};

const CONFIG_FILE_NAME = '.flap-app-launcher.config.json';
const CONFIG_FILE_PATH = (
  process.env.NODE_ENV === 'production'
    ? path.join(homedir(), CONFIG_FILE_NAME)
    : path.join(__dirname, '..', CONFIG_FILE_NAME)
);

let _cachedConfig = null;

function setCachedConfig(data) {
  _cachedConfig = data;
}

function getCachedConfig() {
  return _cachedConfig;
}

function validateValues(data) {
  const newConfig = Object.assign({}, DEFAULT_CONFIG, getCachedConfig());
  Object.keys(newConfig).forEach((key) => {
    if (data[key]) {
      newConfig[key] = data[key];
    }
  });
  return newConfig;
}

function saveConfig(data) {
  data = validateValues(data);
  return new Promise(resolve => (
    fs.writeFile(CONFIG_FILE_PATH, JSON.stringify(data), {flag: 'w'}, (err) => {
      if (err) {
        logger.warn(`Cannot write config file: ${err}`);
      }
      setCachedConfig(data);
      return resolve(data);
    })
  ));
}

function loadConfig() {
  return new Promise((resolve) => {
    const cachedConfig = getCachedConfig();

    if (cachedConfig) {
      return resolve(cachedConfig);
    }

    const fallback = () => {
      logger.info(`Create new config file "${CONFIG_FILE_PATH}"...`);
      saveConfig(DEFAULT_CONFIG);
      setCachedConfig(DEFAULT_CONFIG);
      return resolve(getCachedConfig());
    };

    return fs.readFile(CONFIG_FILE_PATH, (err, data) => {
      if (err) {
        logger.warn(`Cannot read config file "${CONFIG_FILE_PATH}": ${err}`);
        return fallback();
      }

      try {
        setCachedConfig(validateValues(JSON.parse(data)));
      } catch (e) {
        logger.warn(`Cannot parse config file "${CONFIG_FILE_PATH}": ${e}`);
        return fallback();
      }

      logger.info(`Config loaded from file "${CONFIG_FILE_PATH}"`);
      return resolve(getCachedConfig());
    });
  });
}

module.exports = {
  DEFAULT_CONFIG,
  saveConfig,
  loadConfig,
  getCachedConfig,
  setCachedConfig
};
