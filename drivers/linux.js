const exec = require('child_process').exec

module.exports = function LinuxDriver () {
  return {
    getApplicationsList () {
      return new Promise((resolve, reject) => {
        exec('dpkg --get-selections | sed "s/.*deinstall//" | sed "s/install$//g"', (err, result) => {
          if (err) {
            reject(err)
          }
          resolve((result || '').replace(/\t/g, '').split('\n') || [])
        })
      })
        .then((applications) => {
          applications = [] // ignore installed applications
          return new Promise((resolve, reject) => {
            exec(
              'grep -R "Exec=." /usr/share/applications/*.desktop | sed "s/^.*Exec=\\([^%$]\\+\\).*$/\\1/"',
              (err, result) => {
                if (err) {
                  reject(err)
                }
                resolve(applications.concat((result || '').replace(/\t/g, '').replace(/"/g, '').split('\n') || []))
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
    }
  }
}
