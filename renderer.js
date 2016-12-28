const remote = require('electron').remote
const ipc = require('electron').ipcRenderer

function getApplicationsList () {
  return remote.getGlobal('applicationsList');

  // return [{
  //   command: 'chrome',
  //   path: '/opt/google/chrome/chrome'
  // }, {
  //   command: 'chrome-browser',
  //   path: '/opt/google/chrome/chrome'
  // }, {
  //   command: 'chrome-browser-shmauzer',
  //   path: '/opt/google/chrome/chrome'
  // }, {
  //   command: 'gnome-mines',
  //   path: '/usr/games/gnome-mines'
  // }]
}

const applicationsList = getApplicationsList()

const input = document.getElementById('input')
const inputAutocomplete = document.getElementById('autocomplete')

ipc.on('run-command-ok', function (e, result) {
  if (result) {
    input.value = ''
    inputAutocomplete.value = ''
  } else {
    input.style.color = 'red'
    setTimeout(() => input.style.color = 'inherit', 500)
  }
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
  } else if (!input.value) {
    inputAutocomplete.value = ''
  }
})

let lastKeyCode = ''

input.addEventListener('keydown', (e) => {
  const double = (lastKeyCode === e.code)

  lastKeyCode = e.code

  if (e.code === 'Escape') {
    const hide = (!input.value || double)
    input.value = ''
    inputAutocomplete.value = ''
    if (hide) {
      ipc.send('hide')
    }
    e.preventDefault()
  } else if (e.code === 'Enter') {
    const app = applicationsList.find(({command}) => (command === inputAutocomplete.value))
    ipc.send('run-command', app || {path: input.value})
    e.preventDefault()
  } else if (e.code === 'Tab') {
    let next = autocomplete.next()
    if (next.done) {
      autocomplete = autocompleteGenerator(applicationsList, input.value)
      next = autocomplete.next()
    }

    if (next.value) {
      inputAutocomplete.value = next.value
    } else {
      inputAutocomplete.value = (input.value || '')
    }

    e.preventDefault()
  } else if (e.code === 'ArrowRight') {
    input.value = inputAutocomplete.value
  }
})
