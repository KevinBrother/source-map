const path = require('path');
const fs = require('fs');
const babel = require('@babel/core');
const parser = require('@babel/parser');
const types = require('@babel/types');
// traverse 采用的 ES Module 导出，我们通过 requier 引入的话就加个 .default
const traverse = require('@babel/traverse');
const generator = require('@babel/generator');

/* const read = (fileName) => {
  const buffer = fs.readFileSync(fileName, 'utf-8');
  const AST = parser.parse(buffer, { sourceType: 'module' });
  return AST;
};

 */
const compile = (filename) => {
  const dependencies = {};
  const content = fs.readFileSync(filename, 'utf-8');
  // 1.parse 将代码解析为抽象语法树（AST）
  const AST = parser.parse(content, { sourceType: 'module' });

  // 2,traverse 转换代码
  const visitor = {
    CallExpression(path) {
      // 拿到 callee 数据
      const { callee } = path.node;
      // 判断是否是调用了 console.log 方法
      // 1. 判断是否是成员表达式节点，上面截图有详细介绍
      // 2. 判断是否是 console 对象
      // 3. 判断对象的属性是否是 log
      const isConsoleLog = types.isMemberExpression(callee) && callee.object.name === 'console' && callee.property.name === 'log';
      if (isConsoleLog) {
        // 如果是 console.log 的调用 找到上一个父节点是函数
        const funcPath = path.findParent((p) => {
          return p.isFunctionDeclaration();
        });
        // 取函数的名称
        const funcName = funcPath?.node.id.name;
        // 将名称通过 types 来放到函数的参数前面去
        if (funcName) {
          path.node.arguments.unshift(types.stringLiteral(funcName));
        }
      }
    },
    // 获取通过 import 导入的模块
    ImportDeclaration({ node }) {
      // 返回类似于unix目录的命令
      const dirname = path.dirname(filename);
      // 返回一个带有完成标准化路径的字符串，其中包含多有段
      const newFile = './' + path.join(dirname, node.source.value);

      // 保存所有依赖的模块
      dependencies[node.source.value] = newFile;
    }
  };

  traverse.default(AST, visitor);

  /*   // 3. generator 将 AST 转回成代码
  const newCode = generator.default(AST, {}, code);
 */
  // 通过 babel.core 和 @babel/preset-env进行代码的转换
  const { code } = babel.transformFromAst(AST, null, {
    presets: ['@babel/preset-env']
  });

  return { dependencies, filename, code };
};

// entry 为入口文件
function getDepGraph(entry) {
  const entryModule = compile(entry);

  const graphArray = [entryModule];
  // TODO 看下这个小算法为什么能成功啊？
  for (let i = 0; i < graphArray.length; i++) {
    const item = graphArray[i];
    const { dependencies } = item; // 拿到文件依赖的模块集合

    for (let j in dependencies) {
      const dep = compile(dependencies[j]);
      graphArray.push(dep); // 目的是让入口模块及其所有相关的模块放入数组
    }
  }

  // 接下来生成依赖图
  const graph = {};

  graphArray.forEach((item) => {
    graph[item.filename] = {
      dependencies: item.dependencies,
      code: item.code
    };
  });
  return graph;
}

// 实现require方法
function getCode(entry) {
  //要先把对象转换为字符串，不然在下面的模板字符串中会默认调取对象的toString方法，参数变成[Object object],显然不行
  const graph = JSON.stringify(getDepGraph(entry));

  return `
  (function(graph) {
    // require 函数的本质是执行一个模块的代码，然后将相应的变量挂载到exports对象上

    function require(module) {
      function localRequire(relativePath) {
        return require(graph[module].dependencies[relativePath])
      }
      var exports = {};
      (function(require, exports, code) {
        eval(code)
      })(localRequire, exports, graph[module].code)
      return exports;  // 返回模块的exports对象
    }
    require('${entry}')
  })(${graph})`;
}

module.exports = {
  compile,
  getDepGraph,
  getCode
};
