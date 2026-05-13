const prettierConfig = require('@netlify/eslint-config-node/.prettierrc.json')

module.exports = {
  ...prettierConfig,
  endOfLine: 'auto',
}
