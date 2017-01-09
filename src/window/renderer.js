const remote = require('electron').remote
const ipc = require('electron').ipcRenderer
const ipcCommands = require('../ipcCommands.js')

function getApplicationsList () {
  return remote.getGlobal('applicationsList')
}

const applicationsList = getApplicationsList()
const inputUser = document.getElementById('input-user')
const inputAutocomplete = document.getElementById('input-autocomplete')

ipc.on(ipcCommands.RUN_COMMAND_OK, function (e, result) {
  if (result) {
    inputUser.value = ''
    inputAutocomplete.value = ''
  } else {
    //TODO: use styles
    inputUser.style.color = 'red'
    setTimeout(() => inputUser.style.color = 'inherit', 500)
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

inputUser.addEventListener('keyup', (e) => {
  if (e.code !== 'Tab' && inputUser.value) {
    autocomplete = autocompleteGenerator(applicationsList, inputUser.value)
    inputAutocomplete.value = (autocomplete.next().value || inputUser.value)
  }
})

let lastKeyCode = ''

inputUser.addEventListener('keydown', (e) => {
  const double = (lastKeyCode === e.code)

  lastKeyCode = e.code

  if (e.code === 'Escape') {
    const hide = (!inputUser.value || double)
    inputUser.value = ''
    inputAutocomplete.value = ''
    if (hide) {
      ipc.send(ipcCommands.HIDE)
    }
    e.preventDefault()
  } else if (e.code === 'Enter') {
    const app = applicationsList.find(({command}) => (command === inputAutocomplete.value))
    ipc.send(ipcCommands.RUN_COMMAND, app || {path: inputUser.value})
    e.preventDefault()
  } else if (e.code === 'Tab') {
    let next = autocomplete.next()
    if (next.done) {
      autocomplete = autocompleteGenerator(applicationsList, inputUser.value)
      next = autocomplete.next()
    }

    if (next.value) {
      inputAutocomplete.value = next.value
    } else {
      inputAutocomplete.value = (inputUser.value || '')
    }

    e.preventDefault()
  } else if (e.code === 'ArrowRight') {
    inputUser.value = inputAutocomplete.value
  } else {
    inputAutocomplete.value = ''
  }
})
