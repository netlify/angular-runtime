const eslintConfig = require('@netlify/eslint-config-node/.prettierrc.json')

module.exports = {
  ...eslintConfig,
  endOfLine: 'auto',
}
