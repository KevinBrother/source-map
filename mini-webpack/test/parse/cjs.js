const fs = require('fs');
const { compile } = require('./util.js');

const entryPath = '../project/src/cjs/index.js';
const code = fs.readFileSync(entryPath, 'utf-8');

const newCode = compile(code);
console.log('%c [ AST ]-4', 'font-size:13px; background:pink; color:#bf2c9f;', code, newCode);
