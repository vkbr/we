#! /usr/local/env node

const { readFileSync, writeFileSync } = require('fs');
const { resolve } = require('path');

const readmePath = resolve('./README.md');

const readmeContent = readFileSync(readmePath)
.toString('utf8')
.split(/\n|\r/g)
.filter(line => !line.startsWith('_See code:'))
.join('\n');

writeFileSync(readmePath, readmeContent, 'utf8');
