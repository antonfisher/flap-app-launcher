const remote = require('electron').remote;
const ipc = require('electron').ipcRenderer;
const ipcCommands = require('../ipcCommands.js');

function getApplicationsList() {
  return remote.getGlobal('applicationsList');
}

const applicationsList = getApplicationsList();
const inputUser = document.getElementById('input-user');
const inputAutocomplete = document.getElementById('input-autocomplete');

ipc.on(ipcCommands.RUN_COMMAND_OK, function (e, result) {
  if (result) {
    inputUser.value = '';
    inputUser.style.color = 'inherit';
    inputAutocomplete.value = '';
  } else {
    //TODO: use styles
    inputUser.style.color = 'red';
    setTimeout(() => inputUser.style.color = 'inherit', 500);
  }
});

const autocompleteGenerator = function*(list, value) {
  for (let i = 0; i < applicationsList.length; i++) {
    let {command} = applicationsList[i];
    //if (command.substring(0, value.length) === value) {
    if (command.includes(value)) {
      yield command;
    }
  }
};

const removeLeftPad = function (pattern) {
  return (pattern || '').replace(/^ */g, '');
};

const addLeftPad = function (str, pattern) {
  pattern = removeLeftPad(pattern);
  const index = str.indexOf(pattern);
  if (index > -1) {
    return (new Array(index + 1).fill('').join(' ') + pattern);
  } else {
    return pattern;
  }
};

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
  } else if (e.code === 'Enter') {
    //TODO: use styles
    inputUser.style.color = 'yellow';
    const app = applicationsList.find(({command}) => (command === inputAutocomplete.value));
    ipc.send(ipcCommands.RUN_COMMAND, app || {path: value});
    e.preventDefault();
  } else if (e.code === 'Tab') {
    let next = autocomplete.next();
    if (next.done) {
      autocomplete = autocompleteGenerator(applicationsList, value);
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
    autocomplete = autocompleteGenerator(applicationsList, value);
    inputAutocomplete.value = (autocomplete.next().value || '');
  }
  inputUser.value = addLeftPad(inputAutocomplete.value, value);
});
