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
  }, {
    command: 'gnome-mines',
    path: '/usr/games/gnome-mines'
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
  if (e.code !== 'Tab' && input.value) {
    autocomplete = autocompleteGenerator(applicationsList, input.value)
    inputAutocomplete.value = (autocomplete.next().value || input.value)
  }
})

let lastKeyCode = ''
let lastCommand = ''

input.addEventListener('keydown', (e) => {
  const double = (lastKeyCode === e.code)

  lastKeyCode = e.code

  if (e.code === 'Escape') {
    input.value = ''
    inputAutocomplete.value = ''
    if (double) {
      ipc.send('hide')
    }
  } else if (!input.value) {
    inputAutocomplete.value = ''
    return
  } else if (e.code === 'Enter') {
    if (input.value === inputAutocomplete.value && lastCommand === input.value) {
      const app = applicationsList.find(({command}) => (command === input.value))
      ipc.send('run-command', app || {path: input.value})
    } else {
      input.value = inputAutocomplete.value
      lastCommand = input.value
    }
  } else if (e.code === 'Tab') {
    let next = autocomplete.next()
    if (next.done) {
      autocomplete = autocompleteGenerator(applicationsList, input.value)
      next = autocomplete.next()
    }

    if (next.value) {
      input.value = next.value
      inputAutocomplete.value = next.value
    } else {
      inputAutocomplete.value = input.value
    }

    e.preventDefault()
  } else {
    inputAutocomplete.value = ''
  }
})
