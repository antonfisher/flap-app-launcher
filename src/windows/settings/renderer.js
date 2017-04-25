const remote = require('electron').remote;
const ipc = require('electron').ipcRenderer;
const ipcCommands = require('../../ipcCommands');

// references
const sectionVersion = document.getElementById('version');
const inputSettingsWindowWidth = document.getElementById('input-settings-window-width');

function getConfig() {
  return remote.getGlobal('config');
}

function updateValues() {
  const {width} = getConfig();
  sectionVersion.innerHTML = `Version: ${remote.getGlobal('version')}`;
  inputSettingsWindowWidth.value = width;
}

document.addEventListener('keydown', (e) => {
  if (e.code === 'Escape') {
    ipc.send(ipcCommands.CLOSE);
    e.preventDefault();
  }
});


ipc.on(ipcCommands.SETTINGS_UPDATED, () => updateValues());
updateValues();

let inputSettingsWindowWidthTimeout;
inputSettingsWindowWidth.addEventListener('change', ({target: {valueAsNumber}}) => {
  clearTimeout(inputSettingsWindowWidthTimeout);
  inputSettingsWindowWidthTimeout = setTimeout(() => {
    const config = getConfig();
    config.width = valueAsNumber;
    ipc.send(ipcCommands.UPDATE_SETTINGS, config);
  }, 500);
});
