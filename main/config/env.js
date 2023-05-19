'use strict';

const fs = require('fs');
const path = require('path');
const paths = require('./paths');

// Make sure that including paths.js after env.js will read .env variables.
// 确保在env.js之后包含paths.js将读取.env变量。
delete require.cache[require.resolve('./paths')];

const NODE_ENV = process.env.NODE_ENV;
if (!NODE_ENV) {
  // NODE_ENV环境变量是必需的，但没有指定。
  throw new Error(
    'The NODE_ENV environment variable is required but was not specified.'
  );
}

// https://github.com/bkeepers/dotenv#what-other-env-files-can-i-use
const dotenvFiles = [
  `${paths.dotenv}.${NODE_ENV}.local`,
  // Don't include `.env.local` for `test` environment
  // since normally you expect tests to produce the same
  // results for everyone
  // 不要包含 `.env.local` for `test` 环境，因为通常您希望测试对每个人产生相同的结果
  NODE_ENV !== 'test' && `${paths.dotenv}.local`,
  `${paths.dotenv}.${NODE_ENV}`,
  paths.dotenv,
].filter(Boolean);

// 从.env*文件加载环境变量。如果该文件丢失，使用 silent 关闭警告。Dotenv永远不会修改任何已经设置的环境变量。在.env文件中支持变量扩展。
// Load environment variables from .env* files. Suppress warnings using silent
// if this file is missing. dotenv will never modify any environment variables
// that have already been set.  Variable expansion is supported in .env files.
// https://github.com/motdotla/dotenv
// https://github.com/motdotla/dotenv-expand
dotenvFiles.forEach(dotenvFile => {
  if (fs.existsSync(dotenvFile)) {
    require('dotenv-expand')(
      require('dotenv').config({
        path: dotenvFile,
      })
    );
  }
});


// We support resolving modules according to `NODE_PATH`.     我们支持根据' NODE_PATH '解析模块。
// This lets you use absolute paths in imports inside large monorepos:    这允许您在大型单节点中的导入中使用绝对路径:
// https://github.com/facebook/create-react-app/issues/253.
// It works similar to `NODE_PATH` in Node itself:    它的工作原理类似于Node本身的' NODE_PATH ':
// https://nodejs.org/api/modules.html#modules_loading_from_the_global_folders
// Note that unlike in Node, only *relative* paths from `NODE_PATH` are honored.    注意，与Node中不同的是，只有来自' NODE_PATH '的*相对*路径会被尊重。
// Otherwise, we risk importing Node.js core modules into an app instead of webpack shims.    否则，我们可能会把Node.js核心模块而不是webpack模块导入到应用中。
// https://github.com/facebook/create-react-app/issues/1023#issuecomment-265344421
// We also resolve them to make sure all tools using them work consistently.    我们还解决它们，以确保所有使用它们的工具一致地工作。
const appDirectory = fs.realpathSync(process.cwd());  // /Users/shixm/workspace/shixm/shixm.github.io/main

process.env.NODE_PATH = (process.env.NODE_PATH || '')
  .split(path.delimiter)  // path.delimiter 是 :
  .filter(folder => folder && !path.isAbsolute(folder))
  .map(folder => path.resolve(appDirectory, folder))
  .join(path.delimiter);

// Grab NODE_ENV and REACT_APP_* environment variables and prepare them to be
// injected into the application via DefinePlugin in webpack configuration.
// 获取 NODE_ENV 和 REACT_APP_* 环境变量，并准备通过webpack配置中的 DefinePlugin 将它们注入到应用程序中。
const REACT_APP = /^REACT_APP_/i;

function getClientEnvironment(publicUrl) {
  const raw = Object.keys(process.env)
    .filter(key => REACT_APP.test(key))
    .reduce(
      (env, key) => {
        env[key] = process.env[key];
        return env;
      },
      {
        // Useful for determining whether we’re running in production mode.   用于确定我们是否在生产模式下运行。
        // Most importantly, it switches React into the correct mode.     最重要的是，它将React切换到正确的模式。
        NODE_ENV: process.env.NODE_ENV || 'development',
        // Useful for resolving the correct path to static assets in `public`.    用于解析 `public` 中静态资产的正确路径。
        // For example, <img src={process.env.PUBLIC_URL + '/img/logo.png'} />.
        // This should only be used as an escape hatch. Normally you would put images into the `src` and `import` them in code to get their paths.
        // 这只能作为逃生舱口使用。通常你会将图片放入' src '中，并在代码中' import '它们以获得它们的路径。
        PUBLIC_URL: publicUrl,
        // We support configuring the sockjs pathname during development.   我们支持在开发期间配置sockjs路径名。
        // These settings let a developer run multiple simultaneous projects.   这些设置允许开发人员同时运行多个项目。
        // They are used as the connection `hostname`, `pathname` and `port` in webpackHotDevClient.  // 它们被用作webpackHotDevClient中的连接 `hostname`, `pathname` and `port`
        // They are used as the `sockHost`, `sockPath` and `sockPort` options in webpack-dev-server.  它们被用作webpack-dev-server中的 `sockHost`, `sockPath` and `sockPort` 选项
        WDS_SOCKET_HOST: process.env.WDS_SOCKET_HOST,
        WDS_SOCKET_PATH: process.env.WDS_SOCKET_PATH,
        WDS_SOCKET_PORT: process.env.WDS_SOCKET_PORT,
        // Whether or not react-refresh is enabled.   // 是否启用 react-refresh。
        // It is defined here so it is available in the webpackHotDevClient.   // 它是在这里定义的，所以它在webpackHotDevClient中可用。
        FAST_REFRESH: process.env.FAST_REFRESH !== 'false',
      }
    );
  // Stringify all values so we can feed into webpack DefinePlugin
  // 将所有值字符串化，这样我们就可以将其输入webpack DefinePlugin
  const stringified = {
    'process.env': Object.keys(raw).reduce((env, key) => {
      env[key] = JSON.stringify(raw[key]);
      return env;
    }, {}),
  };

  return { raw, stringified };
}

module.exports = getClientEnvironment;
