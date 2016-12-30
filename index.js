const {app, globalShortcut, ipcMain: ipc} = require('electron')

const LinuxDriver = require('./drivers/linux.js')
const createWindow = require('./window.js').createWindow

require('electron-reload')(__dirname)

let wnd
let driver

// 'darwin', 'freebsd', 'linux', 'sunos' or 'win32'
if (process.platform === 'linux') {
  driver = new LinuxDriver()
} else {
  console.log(`ERROR: platform ${process.platform} is not supported.\nPlease send request to a.fschr@gmail.com.`)
  process.exit(1)
}

app.on('ready', () => {
  driver.getApplicationsList()
    .then((applications) => {
      global.applicationsList = applications
      console.log('-- Total applications found:', global.applicationsList.length)
      //console.dir(applications, {colors: true})
    })
    .then(() => {
      wnd = createWindow()
    })
    .then(() => {
      globalShortcut.register('Super+K', () => {
        wnd.setSkipTaskbar(true)
        wnd.setAlwaysOnTop(true)
        wnd.show()
        wnd.focus()
      })

      ipc.on('hide', () => {
        wnd.hide()
      })

      wnd.on('close', () => {
        wnd = null
      })

      ipc.on('run-command', (event, command) => {
        console.log('-- runApplication', command.path);
        driver.runApplication(command, (result) => {
          event.sender.send('run-command-ok', result)
          if (result) {
            wnd.hide()
          }
        })
      })
    })
    .catch((err) => {
      console.log('ERROR:', err);
    })
})

app.on('will-quit', () => {
  globalShortcut.unregisterAll()
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (wnd === null) {
    wnd = createWindow()
  }
})
