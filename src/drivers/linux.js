const os = require('os')
const exec = require('child_process').exec

module.exports = function LinuxDriver () {
  return {
    getApplicationsList () {
      return new Promise((resolve, reject) => {
        return resolve([]) // ignore installed applications
        // exec('dpkg --get-selections | sed "s/.*deinstall//" | sed "s/install$//g"', (err, result) => {
        //   if (err) {
        //     return reject(err)
        //   } else {
        //     return resolve((result || '').replace(/\t/g, '').split(os.EOL) || [])
        //   }
        // })
      })
        .then((applications) => (
          new Promise((resolve, reject) => {
            exec(
              'grep -R "Exec=." /usr/share/applications/*.desktop | sed "s/^.*Exec=\\([^%$]\\+\\).*$/\\1/"',
              (err, result) => {
                result = ((result || '').replace(/\t/g, '').replace(/"/g, ''))

                const desktopApplications = (result.split(os.EOL) || [])
                  .map(app => app.trim())
                  .filter(app => Boolean(app))

                if (err) {
                  return reject(err)
                } else {
                  return resolve(
                    applications.concat(desktopApplications)
                  )
                }
              }
            )
          })
        ))
        .then((applications) => [... new Set(applications)])
        .then((applications) => (
          applications.map((path) => {
            const pathArr = path.split(' ')
            pathArr[0] = pathArr[0].split('/').pop()
            return {
              path,
              command: pathArr.join(' ')
            }
          })
        ))
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
