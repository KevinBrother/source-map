const path = require('path');
module.exports = {
  // entry: './src/esm/index.js',
  entry: './src/cjs/index.js',
  output: {
    filename: 'index.js',
    path: path.resolve(__dirname, 'dist')
  }
};
