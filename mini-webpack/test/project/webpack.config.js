const path = require('path');
module.exports = {
  entry: './outer/index.js',
  output: {
    filename: 'main.js',
    path: path.resolve(__dirname, 'dist')
  }
};
