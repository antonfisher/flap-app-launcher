const ipc = require('electron').ipcRenderer

function getApplicationsList () {
  return [{
    command: 'chrome',
    path: '/opt/google/chrome/chrome'
  }, {
    command: 'chrome-browser',
    path: '/opt/google/chrome/chrome'
  }]
}

const applicationsList = getApplicationsList()

const input = document.getElementById('input')
const inputAutocomplete = document.getElementById('autocomplete')

ipc.once('actionReply', function (response) {
  console.log('-- ipc renderer', response);
})
ipc.send('invokeAction', 'kokoko');

console.log('-- input', input, inputAutocomplete);

const autocomplete = function (n = 0) {
  console.log('-- n', n);
  for (let i = 0; i < applicationsList.length; i++) {
    let {command} = applicationsList[i]
    if (command.substring(0, input.value.length) == input.value) {
      inputAutocomplete.value = command
      if (n == 0) {
        break
      } else {
        n--
      }
    }
  }
}

input.addEventListener('keyup', (e) => {
  console.log('-- UP', e.code);
  if (e.code !== 'Tab' && input.value.length > 0) {
    autocomplete()
  }
})

input.addEventListener('keydown', (e) => {
  console.log('-- code', e.code);
  if (e.code === 'Enter') {
    input.value = inputAutocomplete.value
  }
  if (e.code === 'Escape') {
    input.value = ''
  }

  if (e.code === 'Tab') {
    autocomplete(1)
    e.preventDefault()
  } else {
    inputAutocomplete.value = ''
  }
})
