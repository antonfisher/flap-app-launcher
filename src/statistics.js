const fs = require('fs');
const path = require('path');
const {homedir} = require('os');
const logger = require('./logger');

const STATISTICS_FILE_NAME = '.flap-app-launcher.stats';
const STATISTICS_FILE_PATH = (
  process.env.NODE_ENV === 'production'
    ? path.join(homedir(), STATISTICS_FILE_NAME)
    : path.join(__dirname, '..', STATISTICS_FILE_NAME)
);

let _cachedStats = null;

function setCachedStats(data) {
  _cachedStats = data;
}

function getCachedStats() {
  return _cachedStats;
}

//TODO use promise
function saveStats(data, callback) {
  return fs.writeFile(STATISTICS_FILE_PATH, JSON.stringify(data), {flag: 'w'}, (err) => {
    if (err) {
      logger.warn(`Cannot write statistics file: ${err}`);
    }
    setCachedStats(data);
    if (callback) {
      callback();
    }
  });
}

function loadStats() {
  return new Promise((resolve) => {
    const cachedStats = getCachedStats();

    if (cachedStats) {
      return resolve(cachedStats);
    }

    const fallback = () => {
      logger.info(`Create new statistics file "${STATISTICS_FILE_PATH}"...`);
      saveStats({});
      setCachedStats({});
      return resolve(getCachedStats());
    };

    return fs.readFile(STATISTICS_FILE_PATH, (err, data) => {
      if (err) {
        logger.warn(`Cannot read statistics file "${STATISTICS_FILE_PATH}": ${err}`);
        return fallback();
      }

      try {
        setCachedStats(JSON.parse(data));
      } catch (e) {
        logger.warn(`Cannot parse statistics file "${STATISTICS_FILE_PATH}": ${e}`);
        return fallback();
      }

      logger.info(`Statistics loaded from file "${STATISTICS_FILE_PATH}"`);
      return resolve(getCachedStats());
    });
  });
}

function addRecord(commandPath) {
  return loadStats()
    .then((stats) => {
      stats[commandPath] = stats[commandPath] || 0;
      stats[commandPath]++;
      saveStats(stats);
    });
}

function sortCommands(commands) {
  return commands.sort((a, b) => {
    const aPath = (a.path || a.rawPath);
    const bPath = (b.path || b.rawPath);
    const cachedStats = getCachedStats();
    if (cachedStats) {
      const aRunCount = cachedStats[aPath];
      const bRunCount = cachedStats[bPath];
      if (aRunCount || bRunCount) {
        return ((bRunCount || 0) - (aRunCount || 0));
      }
    }
    return aPath > bPath;
  });
}

module.exports = {
  saveStats,
  loadStats,
  addRecord,
  getCachedStats,
  setCachedStats,
  sortCommands
};
