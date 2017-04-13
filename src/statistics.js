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

function loadStats(callback) {
  const cachedStats = getCachedStats();
  if (cachedStats) {
    if (callback) {
      return callback(cachedStats);
    }
    return null;
  }
  return fs.readFile(STATISTICS_FILE_PATH, (err, data) => {
    if (err) {
      setCachedStats({});
    } else {
      try {
        setCachedStats(JSON.parse(data));
      } catch (e) {
        logger.warn(`Cannot read statistics file: ${e}`);
        setCachedStats({});
      }
    }
    if (callback) {
      callback(getCachedStats());
    }
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
  return loadStats((stats) => {
    stats[commandPath] = stats[commandPath] || 0;
    stats[commandPath]++;
    saveStats(stats);
  });
}

function sortCommands(commands) {
  return commands.sort((a, b) => {
    const cachedStats = getCachedStats();
    if (cachedStats) {
      const aRunCount = cachedStats[a.path];
      const bRunCount = cachedStats[b.path];
      if (aRunCount || bRunCount) {
        return ((bRunCount || 0) - (aRunCount || 0));
      }
    }
    return a.path > b.path;
  });
}

module.exports = {
  loadStats,
  addRecord,
  getCachedStats,
  setCachedStats,
  sortCommands
};
