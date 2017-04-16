# Flap-App-Launcher

[![Build Status](https://travis-ci.org/antonfisher/flap-app-launcher.svg?branch=master)](https://travis-ci.org/antonfisher/flap-app-launcher)
[![Dependency Status](https://dependencyci.com/github/antonfisher/flap-app-launcher/badge)](https://dependencyci.com/github/antonfisher/flap-app-launcher)
[![bitHound Overall Score](https://www.bithound.io/github/antonfisher/flap-app-launcher/badges/score.svg)](https://www.bithound.io/github/antonfisher/flap-app-launcher)
[![License: MIT](https://img.shields.io/badge/license-MIT-green.svg)](https://github.com/antonfisher/flap-app-launcher/blob/master/LICENSE)

This is an applications launcher for Ubuntu.

![Main view](https://raw.githubusercontent.com/antonfisher/flap-app-launcher/docs/images/screenshot-v1.png)

## Features:
- minimalistic design
- suggestions on TAB button
- suggestions respect usage statistic
- run command in the terminal if not found in the index
- history of any run commnads.

## Application list source:
- main menu shortcuts
- any commands what were run before.

## Instalation:
Default HotKey: `Super+Space`.

### Using NPM:
```bash
npm install -g flap-app-launcher
```
Add to autorun on Ubuntu:

![Main view](https://raw.githubusercontent.com/antonfisher/flap-app-launcher/docs/images/autorun-ubuntu-v1.png)

### Development mode:
```bash
git clone git@github.com:antonfisher/flap-app-launcher.git
cd flap-app-launcher
npm install
npm start
```

## ToDo:
- [x] run history
- [ ] build binaries
- [ ] tests
- [ ] configuration file
- [ ] configuration window
- [ ] driver for iOS/Win?
