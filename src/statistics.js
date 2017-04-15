const fs = require('fs');
const path = require('path');
const logger = require('./logger.js');

const STATISTICS_FILE_NAME = 'flap-app-launcher.stats';
const STATISTICS_FILE_PATH = path.join(__dirname, '..', STATISTICS_FILE_NAME);

let _cachedStats = null;

function setCachedStats(data) {
  _cachedStats = data;
}

function getCachedStats() {
  return _cachedStats;
}

function saveStats(data) {
  return fs.writeFile(STATISTICS_FILE_PATH, JSON.stringify(data), {flag: 'w'}, (err) => {
    if (err) {
      logger.warn(`Cannot write statistics file: ${err}`);
    } else {
      logger.info(`New statistics file: ${STATISTICS_FILE_PATH}`);
    }
    setCachedStats(data);
  });
}

function loadStats() {
  return new Promise((resolve) => {
    const cachedStats = getCachedStats();

    if (cachedStats) {
      return resolve(cachedStats);
    }

    const fallback = () => {
      logger.info('Create new statistics file...');
      saveStats({});
      setCachedStats({});
      return resolve(getCachedStats());
    };

    return fs.readFile(STATISTICS_FILE_PATH, (err, data) => {
      if (err) {
        logger.warn(`Cannot read statistics file: ${err}`);
        return fallback();
      }

      try {
        setCachedStats(JSON.parse(data));
      } catch (e) {
        logger.warn(`Cannot parse statistics file: ${e}`);
        return fallback();
      }

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
  loadStats,
  addRecord,
  getCachedStats,
  setCachedStats,
  sortCommands
};
