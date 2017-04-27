const os = require('os');
const exec = require('child_process').exec;

module.exports = function LinuxDriver() {
  return {
    getApplicationList() {
      return new Promise((resolve, reject) => {
        exec(
          'grep -R "Exec=." /usr/share/applications/*.desktop | sed "s/^.*Exec=\\([^%$]\\+\\).*$/\\1/"',
          (err, result) => {
            result = ((result || '').replace(/\t/g, '').replace(/"/g, ''));

            const desktopApplications = (result.split(os.EOL) || [])
              .map(app => app.trim())
              .filter(app => Boolean(app));

            if (err) {
              return reject(err);
            }

            return resolve(desktopApplications);
          }
        );
      })
        .then(applications => [...new Set(applications)])
        .then(applications => (
          applications.map((path) => {
            const pathArr = path.split(' ');
            pathArr[0] = pathArr[0].split('/').pop();
            return {
              path,
              command: pathArr.join(' ')
            };
          })
        ));
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
