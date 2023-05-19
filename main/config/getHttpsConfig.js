'use strict';

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const chalk = require('react-dev-utils/chalk');
const paths = require('./paths');

// Ensure the certificate and key provided are valid and if not
// throw an easy to debug error
// 确保所提供的证书和密钥有效，如果无效则抛出一个易于调试的错误
function validateKeyAndCerts({ cert, key, keyFile, crtFile }) {
  let encrypted;
  try {
    // publicEncrypt will throw an error with an invalid cert
    // publicEncrypt将抛出带有无效证书的错误
    encrypted = crypto.publicEncrypt(cert, Buffer.from('test'));
  } catch (err) {
    throw new Error(
      `The certificate "${chalk.yellow(crtFile)}" is invalid.\n${err.message}`
    );
  }

  try {
    // privateDecrypt will throw an error with an invalid key
    // privateDecrypt将抛出带有无效密钥的错误
    crypto.privateDecrypt(key, encrypted);
  } catch (err) {
    throw new Error(
      `The certificate key "${chalk.yellow(keyFile)}" is invalid.\n${
        err.message
      }`
    );
  }
}

// Read file and throw an error if it doesn't exist
// 读取文件，如果不存在则抛出错误
function readEnvFile(file, type) {
  if (!fs.existsSync(file)) {
    throw new Error(
      `You specified ${chalk.cyan(
        type
      )} in your env, but the file "${chalk.yellow(file)}" can't be found.`
    );
  }
  return fs.readFileSync(file);
}

// Get the https config   获取https配置
// Return cert files if provided in env, otherwise just true or false
// 如果在 env 中提供，则返回证书文件，否则仅为true或false
function getHttpsConfig() {
  const { SSL_CRT_FILE, SSL_KEY_FILE, HTTPS } = process.env;
  const isHttps = HTTPS === 'true';

  if (isHttps && SSL_CRT_FILE && SSL_KEY_FILE) {
    const crtFile = path.resolve(paths.appPath, SSL_CRT_FILE);
    const keyFile = path.resolve(paths.appPath, SSL_KEY_FILE);
    const config = {
      cert: readEnvFile(crtFile, 'SSL_CRT_FILE'),
      key: readEnvFile(keyFile, 'SSL_KEY_FILE'),
    };

    validateKeyAndCerts({ ...config, keyFile, crtFile });
    return config;
  }
  return isHttps;
}

module.exports = getHttpsConfig;
