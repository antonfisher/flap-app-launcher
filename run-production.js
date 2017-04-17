#!/usr/bin/env node

//TODO better way to run electronjs apps

const path = require('path');
const exec = require('child_process').exec;

const app = exec(`cd ${path.join(__dirname)} && export NODE_ENV=production && npm start`);

app.stdout.pipe(process.stdout);
