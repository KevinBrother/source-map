const fs = require('fs');
const path = require('path');
const { compile } = require('./util.js');

const entryPath = '../project/src/esm/index.js';
const code = fs.readFileSync(entryPath, 'utf-8');
const dirname = path.dirname(entryPath);
const newCode = compile(code, dirname);
console.log('%c [ AST ]-4', 'font-size:13px; background:pink; color:#bf2c9f;', newCode);
