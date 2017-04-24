const remote = require('electron').remote;
const ipc = require('electron').ipcRenderer;
const ipcCommands = require('../../ipcCommands');

const version = document.getElementById('version');
//const inputSettingsWindowWidth = document.getElementById('input-settings-window-width');

document.addEventListener('keydown', (e) => {
  if (e.code === 'Escape') {
    ipc.send(ipcCommands.CLOSE);
    e.preventDefault();
  }
});

version.innerHTML = `Version: ${remote.getGlobal('version')}`;

//ipc.on(ipcCommands.RUN_COMMAND_DONE, (e, success) => {
//
//});

//inputSettingsWindowWidth.addEventListener('keydown', (e) => {
//
//});
