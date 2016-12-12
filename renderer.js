const ipc = require('electron').ipcRenderer

function getApplicationsList () {
  return [{
    command: 'chrome',
    path: '/opt/google/chrome/chrome'
  }, {
    command: 'chrome-browser',
    path: '/opt/google/chrome/chrome'
  }, {
    command: 'chrome-browser-shmauzer',
    path: '/opt/google/chrome/chrome'
  }]
}

const applicationsList = getApplicationsList()

const input = document.getElementById('input')
const inputAutocomplete = document.getElementById('autocomplete')

ipc.on('run-command-ok', function () {
  input.value = ''
  inputAutocomplete.value = ''
})

const autocompleteGenerator = function* (list, value) {
  for (let i = 0; i < applicationsList.length; i++) {
    let {command} = applicationsList[i]
    if (command.substring(0, value.length) === value) {
      yield command
    }
  }
}

let autocomplete = null

input.addEventListener('keyup', (e) => {
  if (e.code !== 'Tab' && input.value.length > 0) {
    autocomplete = autocompleteGenerator(applicationsList, input.value)
    inputAutocomplete.value = (autocomplete.next().value || input.value)
  }
})

let lastCommand = ''

input.addEventListener('keydown', (e) => {
  if (e.code === 'Enter') {
    if (input.value === inputAutocomplete.value && lastCommand === input.value) {
      ipc.send('run-command', applicationsList.find(({command}) => (command === input.value)))
    } else {
      input.value = inputAutocomplete.value
      lastCommand = input.value
    }
  } else if (e.code === 'Escape') {
    input.value = ''
  } else if (e.code === 'Tab') {
    const next = autocomplete.next()
    if (next.done) {
      autocomplete = autocompleteGenerator(applicationsList, input.value)
      inputAutocomplete.value = autocomplete.next().value
    } else {
      inputAutocomplete.value = next.value
    }
    e.preventDefault()
  } else {
    inputAutocomplete.value = ''
  }
})
