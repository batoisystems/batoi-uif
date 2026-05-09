module.exports = {
  root: true,
  env: { browser: true, es2022: true, node: true },
  extends: ['eslint:recommended', 'prettier'],
  ignorePatterns: ['dist', 'node_modules']
};
