const fs = require('fs');
const {join} = require('path');
const {EOL, homedir} = require('os');
const {exec} = require('child_process');
const logger = require('../logger');

/**
 * @param {String} content - content of the *.desktop file
 * @returns {Array} [{path, command}]
 */
function parseDesktopFile(content = '') {
  const apps = [];
  let path;
  let command;

  content.split(EOL).forEach((line) => {
    const cutName = line.replace(/^Name=(.+)$/, '$1');
    if (cutName !== line) {
      command = cutName.toLowerCase();
    }
    const cutExec = line.replace(/^Exec=(.+)$/, '$1');
    if (cutExec !== line) {
      path = cutExec.replace(/\t/g, '').replace(/"/g, '').replace(/ +[%$].+$/, '');
    }
    if (path && command) {
      apps.push({path, command});
      path = null;
      command = null;
    }
  });

  return apps;
}

/**
 * @param {String}  path     - path to *.desktop files directory
 * @param {Boolean} useNames - use "Name=" from *.desktop files
 * @returns {Promise}
 */
function parseApplicationsFolder(path, useNames = false) {
  return new Promise((resolve) => {
    const applications = [];
    fs.readdir(path, (err, fileNames) => {
      if (err) {
        logger.error(`Cannot read user applications in directory: ${path}`);
        return resolve(applications);
      }
      fileNames
        .filter(filename => filename.endsWith('.desktop'))
        .forEach((filename) => {
          const content = fs.readFileSync(join(path, filename)).toString();
          parseDesktopFile(content).forEach((app) => {
            if (useNames) {
              applications.push(app);
            } else {
              const pathArr = app.path.split(' ');
              pathArr[0] = pathArr[0].split('/').pop();
              applications.push({path: app.path, command: pathArr.join(' ')});
            }
          });
        });
      return resolve(applications);
    });
  });
}

module.exports = function LinuxDriver() {
  return {
    getApplicationList() {
      return Promise.all([
        parseApplicationsFolder(join('/usr', 'share', 'applications')),
        parseApplicationsFolder(join(homedir(), '.local', 'share', 'applications'), true)
      ])
        .then(([globalApplications, userApplications]) => ([].concat(globalApplications, userApplications)))
        .then((applications) => {
          const uniqueMap = new Map();
          return applications.filter(({command}) => (!uniqueMap.has(command) ? uniqueMap.set(command, true) : false));
        });
    },

    runApplication(command, callback) {
      let done = false;
      const callbackTimeout = setTimeout(() => {
        done = true;
        callback(true);
      }, 250);

      //TODO use "shell.openItem(fullPath)"?
      let execString = null;
      if (command.path) {
        execString = `${command.path} &`;
      } else if (command.rawPath) {
        execString = `x-terminal-emulator -e 'sh -c "${command.rawPath};bash"' &`;
      }

      exec(execString, (err) => {
        if (!done) {
          clearTimeout(callbackTimeout);
          callback(!err);
        }
      });
    }
  };
};
