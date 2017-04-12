const remote = require('electron').remote;
const ipc = require('electron').ipcRenderer;
const ipcCommands = require('../ipcCommands.js');

function getApplicationList() {
  return remote.getGlobal('applicationList');
}

const applicationList = getApplicationList();
const inputUser = document.getElementById('input-user');
const inputAutocomplete = document.getElementById('input-autocomplete');

ipc.on(ipcCommands.RUN_COMMAND_DONE, function (e, success) {
  if (success) {
    inputUser.value = '';
    inputUser.style.color = 'inherit'
    inputAutocomplete.value = '';
  } else {
    //TODO: use styles
    inputUser.style.color = 'red';
    setTimeout(() => inputUser.style.color = 'inherit', 1000);
  }
});

const autocompleteGenerator = function*(list, value) {
  for (let i = 0; i < applicationList.length; i++) {
    let {command} = applicationList[i];
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
  } else if (e.code === 'Enter' && value) {
    //TODO: use styles
    inputUser.style.color = 'yellow';
    const command = applicationList.find(({command}) => (command === inputAutocomplete.value));
    ipc.send(ipcCommands.RUN_COMMAND, command || {rawPath: value});
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
