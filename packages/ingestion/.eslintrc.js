const baseConfig = require('../common/.eslintrc.base');

module.exports = {
  ...baseConfig,
  parserOptions: {
    ...baseConfig.parserOptions,
    tsconfigRootDir: __dirname,
  },
  root: true,
};
