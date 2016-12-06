const ipc = require('electron').ipcRenderer

function getApplicationsList () {
  return [{
    command: 'chrome',
    path: '/opt/google/chrome/chrome'
  }]
}

const applicationsList = getApplicationsList()

const input = document.getElementById('input')

ipc.once('actionReply', function (response) {
  console.log('-- ipc renderer', response);
})
ipc.send('invokeAction', 'kokoko');

console.log('-- input', input);
