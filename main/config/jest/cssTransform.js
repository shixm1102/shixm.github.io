'use strict';

// 这是一个自定义的Jest转换器，将样式导入转换为空对象。
// This is a custom Jest transformer turning style imports into empty objects.
// http://facebook.github.io/jest/docs/en/webpack.html

module.exports = {
  process() {
    return 'module.exports = {};';
  },
  getCacheKey() {
    // The output is always the same.   输出总是相同的。
    return 'cssTransform';
  },
};
