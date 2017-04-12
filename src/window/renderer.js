const remote = require('electron').remote;
const ipc = require('electron').ipcRenderer;
const ipcCommands = require('../ipcCommands.js');

function getApplicationList() {
  return remote.getGlobal('applicationList');
}

const applicationList = getApplicationList();
const inputUser = document.getElementById('input-user');
const inputAutocomplete = document.getElementById('input-autocomplete');

function* autocompleteGenerator(list, value) {
  for (let i = 0; i < applicationList.length; i++) {
    const {command} = applicationList[i];
    // if (command.substring(0, value.length) === value) {
    if (command.includes(value)) {
      yield command;
    }
  }
}

function removeLeftPad(pattern) {
  return (pattern || '').replace(/^ */g, '');
}

function addLeftPad(str, pattern) {
  const trimmedPattern = removeLeftPad(pattern);
  const index = str.indexOf(trimmedPattern);
  if (index > -1) {
    return (new Array(index + 1).fill('').join(' ') + trimmedPattern);
  }
  return trimmedPattern;
}

ipc.on(ipcCommands.RUN_COMMAND_DONE, (e, success) => {
  if (success) {
    inputUser.value = '';
    inputUser.style.color = 'inherit';
    inputAutocomplete.value = '';
  } else {
    // TODO: use styles
    inputUser.style.color = 'red';
    setTimeout(() => {
      inputUser.style.color = 'inherit';
    }, 1000);
  }
});

let autocomplete = null;
let lastKeyCode = '';

inputUser.addEventListener('keydown', (e) => {
  const value = removeLeftPad(inputUser.value);
  const double = (lastKeyCode === e.code);

  lastKeyCode = e.code;

  if (e.code === 'Escape') {
    const hide = (!value || double);
    inputUser.value = '';
    inputAutocomplete.value = '';
    if (hide) {
      ipc.send(ipcCommands.HIDE);
    }
    e.preventDefault();
  } else if (e.code === 'Enter' && value) {
    // TODO: use styles
    inputUser.style.color = 'yellow';
    const appCommand = applicationList.find(({command}) => (command === inputAutocomplete.value));
    ipc.send(ipcCommands.RUN_COMMAND, appCommand || {rawPath: value});
    e.preventDefault();
  } else if (e.code === 'Tab') {
    let next = autocomplete.next();
    if (next.done) {
      autocomplete = autocompleteGenerator(applicationList, value);
      next = autocomplete.next();
    }

    if (next.value) {
      inputAutocomplete.value = next.value;
    } else {
      inputAutocomplete.value = value;
    }

    e.preventDefault();
  } else if (e.code === 'ArrowRight') {
    inputUser.value = inputAutocomplete.value;
  } else {
    inputAutocomplete.value = '';
  }
});

inputUser.addEventListener('keyup', (e) => {
  const value = removeLeftPad(inputUser.value);
  if (e.code !== 'Tab' && value) {
    autocomplete = autocompleteGenerator(applicationList, value);
    inputAutocomplete.value = (autocomplete.next().value || '');
  }
  inputUser.value = addLeftPad(inputAutocomplete.value, value);
});
