const os = require('os')
const exec = require('child_process').exec

module.exports = function LinuxDriver () {
  return {
    getApplicationsList () {
      return new Promise((resolve, reject) => {
        exec('dpkg --get-selections | sed "s/.*deinstall//" | sed "s/install$//g"', (err, result) => {
          if (err) {
            return reject(err)
          } else {
            return resolve([]) // ignore installed applications
            //return resolve((result || '').replace(/\t/g, '').split(os.EOL) || [])
          }
        })
      })
        .then((applications) => {
          return new Promise((resolve, reject) => {
            exec(
              'grep -R "Exec=." /usr/share/applications/*.desktop | sed "s/^.*Exec=\\([^%$]\\+\\).*$/\\1/"',
              (err, result) => {
                if (err) {
                  return reject(err)
                } else {
                  return resolve(
                    applications.concat((result || '').replace(/\t/g, '').replace(/"/g, '').split(os.EOL) || [])
                  )
                }
              }
            )
          })
        })
        .then((applications) => {
          return [... new Set(applications)]
        })
        .then((applications) => applications.map((path) => {
            return {
              path,
              command: path.split('/').pop()
            }
          })
        )
    },

    runApplication(command, callback) {
      const callbackTimeout = setTimeout(() => callback(true), 200)

      exec(command.path, function (err) {
        clearTimeout(callbackTimeout)
        callback(!err)
      })
    }
  }
}
