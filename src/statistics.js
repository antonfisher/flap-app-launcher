const fs = require('fs');
const path = require('path');
const logger = require('./logger.js');

const STATISTICS_FILE_NAME = 'flap-app-launcher.stats';
const STATISTICS_FILE_PATH = path.join(__dirname, '..', STATISTICS_FILE_NAME);

let cachedStats = null;

const loadStats = function (callback) {
  if (cachedStats) {
    return callback(cachedStats);
  } else {
    fs.readFile(STATISTICS_FILE_PATH, (err, data) => {
      if (err) {
        cachedStats = {};
      } else {
        try {
          cachedStats = JSON.parse(data);
        } catch (e) {
          logger.warn(`Cannot read statistics file: ${e}`);
          cachedStats = {};
        }
      }
      callback(cachedStats);
    });
  }
};

const saveStats = function (data) {
  fs.writeFile(STATISTICS_FILE_PATH, JSON.stringify(data), {flag: 'w'}, (err) => {
    if (err) {
      logger.error(`Cannot write statistics file: ${err}`);
    }
    cachedStats = data;
  });
};

const addStatRecord = function (path) {
  loadStats((stats) => {
    stats[path] = stats[path] || 0;
    stats[path]++;
    saveStats(stats);
  });
};

const sortCommands = function (commands) {
  return commands.sort();
}

module.exports = {
  loadStats,
  addStatRecord,
  sortCommands
};
