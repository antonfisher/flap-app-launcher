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

function loadStats() {
  return new Promise((resolve, reject) => {
    const cachedStats = getCachedStats();

    if (cachedStats) {
      return resolve(cachedStats);
    }

    return fs.readFile(STATISTICS_FILE_PATH, (err, data) => {
      if (err) {
        logger.warn(`Cannot read statistics file: ${err}`);
        setCachedStats({});
        return reject(err);
      }

      try {
        setCachedStats(JSON.parse(data));
      } catch (e) {
        logger.warn(`Cannot parse statistics file: ${e}`);
        setCachedStats({});
        return reject(e);
      }

      return resolve(getCachedStats());
    });
  });
}

function saveStats(data) {
  return fs.writeFile(STATISTICS_FILE_PATH, JSON.stringify(data), {flag: 'w'}, (err) => {
    if (err) {
      logger.error(`Cannot write statistics file: ${err}`);
    }
    setCachedStats(data);
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
