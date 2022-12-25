const path = require('path');
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
const compile = (code, dirname = '') => {
  const dependencies = {};

  // 1.parse 将代码解析为抽象语法树（AST）
  const AST = parser.parse(code, { sourceType: 'module' });
  console.log('%c [ AST ]-19', 'font-size:13px; background:pink; color:#bf2c9f;', AST);

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
    ImportDeclaration({ node }) {
      // 函数名是 AST 中包含的内容，参数是一些节点，node 表示这些节点下的子内容
      // 我们从抽象语法树里面拿到的路径是相对路径，然后我们要处理它，在 bundler.js 中才能正确使用
      const newDirname = './' + path.join(dirname, node.source.value).replace('\\', '/'); // 将dirname 和 获取到的依赖联合生成绝对路径
      console.log('%c [ newDirname ]-46', 'font-size:13px; background:pink; color:#bf2c9f;', newDirname);
      dependencies[node.source.value] = newDirname; // 将源路径和新路径以 key-value 的形式存储起来
    }
  };

  traverse.default(AST, visitor);

  // 3. generator 将 AST 转回成代码
  const newCode = generator.default(AST, {}, code);

  return { dependencies, code: newCode };
};

module.exports = {
  compile
};
