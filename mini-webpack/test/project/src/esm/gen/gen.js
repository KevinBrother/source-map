(function (graph) {
  // require 函数的本质是执行一个模块的代码，然后将相应的变量挂载到exports对象上

  function load(module) {
    function localRequire(relativePath) {
      return load(graph[module].dependencies[relativePath]);
    }
    var exports = {};
    (function (require, exports, code) {
      eval(code);
    })(localRequire, exports, graph[module].code);
    return exports; // 返回模块的exports对象
  }
  load('../project/src/esm/index.js');
})({
  '../project/src/esm/index.js': {
    dependencies: { './message.js': './../project/src/esm/message.js' },
    code: '"use strict";\n\nvar _message = _interopRequireDefault(require("./message.js"));\nfunction _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }\nconsole.log(_message["default"]);'
  },
  './../project/src/esm/message.js': {
    dependencies: { './word.js': './../project/src/esm/word.js' },
    code: '"use strict";\n\nObject.defineProperty(exports, "__esModule", {\n  value: true\n});\nexports["default"] = void 0;\nvar _word = require("./word.js");\nvar message = "say ".concat(_word.word);\nvar _default = message;\nexports["default"] = _default;'
  },
  './../project/src/esm/word.js': {
    dependencies: {},
    code: '"use strict";\n\nObject.defineProperty(exports, "__esModule", {\n  value: true\n});\nexports.word = void 0;\nvar word = \'hello\';\nexports.word = word;'
  }
});
