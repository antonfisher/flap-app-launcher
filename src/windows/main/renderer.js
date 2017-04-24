const remote = require('electron').remote;
const ipc = require('electron').ipcRenderer;
const ipcCommands = require('../../ipcCommands.js');
const {addLeftPad, removeLeftPad} = require('../../stringUtils');

function getApplicationList() {
  return remote.getGlobal('applicationList');
}

const applicationList = getApplicationList();
const inputUser = document.getElementById('input-user');
const inputAutocomplete = document.getElementById('input-autocomplete');
const iconSettings = document.getElementById('icon-settings');

function* autocompleteGenerator(list, value) {
  for (let i = 0; i < list.length; i++) {
    const {command} = list[i];
    if (command.includes(value)) {
      yield command;
    }
  }
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
  const userValue = removeLeftPad(inputUser.value);
  const autocompleteValue = inputAutocomplete.value;
  const double = (lastKeyCode === e.code);

  lastKeyCode = e.code;

  if (e.code === 'Escape') {
    const hide = (!userValue || double);
    inputUser.value = '';
    inputAutocomplete.value = '';
    if (hide) {
      ipc.send(ipcCommands.HIDE);
    }
    e.preventDefault();
  } else if (e.code === 'Enter' && userValue) {
    // TODO: use styles
    inputUser.style.color = 'yellow';
    const appCommand = applicationList.find(({command}) => (command === inputAutocomplete.value));
    ipc.send(ipcCommands.RUN_COMMAND, appCommand || {rawPath: userValue});
    e.preventDefault();
  } else if (e.code === 'Tab') {
    let next = autocomplete.next();
    if (next.done) {
      autocomplete = autocompleteGenerator(applicationList, userValue);
      next = autocomplete.next();
    }

    if (next.value) {
      inputAutocomplete.value = next.value;
    } else {
      inputAutocomplete.value = userValue;
    }

    e.preventDefault();
  } else if (e.code === 'ArrowRight') {
    inputUser.value = inputAutocomplete.value;
  }

  if (userValue !== inputUser.value || autocompleteValue !== inputAutocomplete.value) {
    inputUser.value = addLeftPad(inputAutocomplete.value, inputUser.value);
  }
});

inputUser.addEventListener('input', () => {
  const value = removeLeftPad(inputUser.value);

  if (value) {
    autocomplete = autocompleteGenerator(applicationList, value);
    inputAutocomplete.value = (autocomplete.next().value || '');
    inputUser.value = addLeftPad(inputAutocomplete.value, value);
  } else {
    inputAutocomplete.value = '';
    inputUser.value = '';
  }
});

iconSettings.addEventListener('click', () => {
  ipc.send(ipcCommands.OPEN_SETTINGS_WINDOW);
});
