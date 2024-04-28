module.exports = {
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: 'tsconfig.json',
    tsconfigRootDir: __dirname,
    sourceType: 'module'
  },
  plugins: ['@typescript-eslint/eslint-plugin'],
  extends: ['plugin:@typescript-eslint/recommended', 'plugin:prettier/recommended'],
  root: true,
  env: {
    node: true,
    jest: true
  },
  ignorePatterns: ['.eslintrc.js'],
  rules: {
    '@typescript-eslint/interface-name-prefix': 'off',
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/no-explicit-any': 'off',
    'comma-dangle': 'off',
    'prettier/prettier': [
      'error',
      {
        // parser: 'flow',
        // 单引号
        singleQuote: true,
        // 单行长度
        printWidth: 300,
        // 缩进
        tabWidth: 2,
        // 行末逗号
        trailingComma: 'none',
        // 箭头函数括号是否可省略
        arrowParens: 'avoid',
        // 行尾序列
        endOfLine: 'auto',
        // 末尾使用 分号
        semi: true
      }
    ]
  }
}
