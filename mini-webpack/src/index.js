// TODO 解析命令行参数，现在先默认是build形式
// @ts-check
// const args = process.argv;
const { resolve } = require('path');
const { readFileSync } = require('fs');

const cwdPath = process.cwd();
let options = {
  entry: './src/index.js',
  output: {
    filename: 'main.js',
    path: resolve(cwdPath, 'dist')
  }
};
const webpackConfigPath = resolve(cwdPath, 'webpack.config.js');
// 1. 获取webpack.config.js 的内容
(function getWebpackConfig() {
  const userOptions = require(webpackConfigPath);
  options = Object.assign(options, userOptions);

  // console.log('%c [ webpackConfig ]-13', 'font-size:13px; background:pink; color:#bf2c9f;', userOptions, options);
})();

// 2. 获取entry的值，并调用解析方法
(function resolveEntry() {
  const entryPath = resolve(cwdPath, options.entry);
  const entryCode = require(entryPath);
  // console.log('%c [ entryCode ]-28', 'font-size:13px; background:pink; color:#bf2c9f;', entryCode);
})();

// 3. 获取output的值，并调用生成的方法
