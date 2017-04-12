const fs = require('fs');
const path = require('path');
const logger = require('./logger.js');

const STATISTICS_FILE_NAME = 'flap-app-launcher.stats';
const STATISTICS_FILE_PATH = path.join(__dirname, '..', STATISTICS_FILE_NAME);

let cachedStats = null;

function loadStats(callback) {
  if (cachedStats) {
    return callback(cachedStats);
  }
  return fs.readFile(STATISTICS_FILE_PATH, (err, data) => {
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

function saveStats(data) {
  return fs.writeFile(STATISTICS_FILE_PATH, JSON.stringify(data), {flag: 'w'}, (err) => {
    if (err) {
      logger.error(`Cannot write statistics file: ${err}`);
    }
    cachedStats = data;
  });
}

function addStatRecord(commandPath) {
  return loadStats((stats) => {
    stats[commandPath] = stats[commandPath] || 0;
    stats[commandPath]++;
    saveStats(stats);
  });
}

function sortCommands(commands) {
  return commands.sort();
  // return commands.sort((a, b) => {
  //   const aRunCount = cachedStats[a.path];
  //   const bRunCount = cachedStats[b.path];
  //   if (aRunCount || bRunCount) {
  //     return (aRunCount || 0) > (bRunCount || 0);
  //   }
  //   return a.path > b.path;
  // });
}

module.exports = {
  loadStats,
  addStatRecord,
  sortCommands
};
