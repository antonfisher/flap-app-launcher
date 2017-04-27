const remote = require('electron').remote;
const ipc = require('electron').ipcRenderer;
const ipcCommands = require('../../ipcCommands');

// references
const sectionVersion = document.getElementById('version');
const settingsInputWidth = document.getElementById('settings-input-width');
const settingsHotkeyModifier = document.getElementById('settings-hotkey-modifier');
const settingsHotkeySecondKey = document.getElementById('settings-hotkey-second-key');
const settingsActionsSave = document.getElementById('settings-actions-save');
const settingsActionsClose = document.getElementById('settings-actions-close');

function getConfig() {
  return remote.getGlobal('config');
}

function updateValues() {
  const {width, hotkey} = getConfig();
  const [hotkeyModifier, hotkeySecondKey] = hotkey.split('+');

  sectionVersion.innerHTML = `Version: ${remote.getGlobal('version')}`;
  settingsInputWidth.value = width;
  settingsHotkeyModifier.value = hotkeyModifier;
  settingsHotkeySecondKey.value = hotkeySecondKey;
}

document.addEventListener('keydown', (e) => {
  if (e.code === 'Escape') {
    ipc.send(ipcCommands.CLOSE_SETTINGS_WINDOW);
    e.preventDefault();
  }
});

settingsActionsClose.addEventListener('click', () => {
  ipc.send(ipcCommands.CLOSE_SETTINGS_WINDOW);
});

settingsActionsSave.addEventListener('click', () => {
  const config = Object.assign({}, getConfig());
  config.width = settingsInputWidth.valueAsNumber;
  config.hotkey = `${settingsHotkeyModifier.value}+${settingsHotkeySecondKey.value}`;
  ipc.send(ipcCommands.UPDATE_SETTINGS, config);
});

ipc.on(ipcCommands.SETTINGS_UPDATED, () => ipc.send(ipcCommands.CLOSE_SETTINGS_WINDOW));
updateValues();
