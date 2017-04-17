# Flap-App-Launcher

[![Build Status](https://travis-ci.org/antonfisher/flap-app-launcher.svg?branch=master)](https://travis-ci.org/antonfisher/flap-app-launcher)
[![Dependency Status](https://dependencyci.com/github/antonfisher/flap-app-launcher/badge)](https://dependencyci.com/github/antonfisher/flap-app-launcher)
[![bitHound Overall Score](https://www.bithound.io/github/antonfisher/flap-app-launcher/badges/score.svg)](https://www.bithound.io/github/antonfisher/flap-app-launcher)
[![Coverage Status](https://coveralls.io/repos/github/antonfisher/flap-app-launcher/badge.svg?branch=master)](https://coveralls.io/github/antonfisher/flap-app-launcher?branch=master)
[![License: MIT](https://img.shields.io/badge/license-MIT-green.svg)](https://github.com/antonfisher/flap-app-launcher/blob/master/LICENSE)

This is an applications launcher for Ubuntu.

![Main view](https://raw.githubusercontent.com/antonfisher/flap-app-launcher/docs/images/flap-app-launcher-demo-v1.gif)

## Features:
- minimalistic design
- suggestions on TAB button
- suggestions respect usage statistics
- run printed command in the terminal if not found in the index
- history of any run commnads.

The application list generates from:
- main menu shortcuts
- any commands what were run before.

## Configuration:
Default HotKey: `Super+Space`.

## Instalation:

### Using NPM:
```bash
sudo npm install -g flap-app-launcher
```
Run anywhere with `flap-app-launcher`.

### Download binaries:
```bash
wget https://github.com/antonfisher/flap-app-launcher/releases/download/v1.0.3/flap-app-launcher-linux-x64.tar.gz
tar -xzf flap-app-launcher-linux-x64.tar.gz
cd ./flap-app-launcher-linux-x64
./flap-app-launcher
```

### From sources:
```bash
git clone git@github.com:antonfisher/flap-app-launcher.git
cd flap-app-launcher
npm install
npm run lint
npm test
npm start   # production mode
npm run dev # development mode
```

## Add to the autorun on Ubuntu:

The _Command_ must be:
- for NPM installation: `flap-app-launcher`
- for binaries installation: `%PATH_TO_BINARIES%/flap-app-launcher`.

![Main view](https://raw.githubusercontent.com/antonfisher/flap-app-launcher/docs/images/autorun-ubuntu-v2.png)

## ToDo:
- [ ] automate release process
- [ ] automate build binaries
- [ ] tests coverage
- [ ] configuration file
- [ ] configuration window (?)
- [ ] driver for iOS/Win (?)
