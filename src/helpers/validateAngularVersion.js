const { satisfies } = require('semver')

// Ensure site is using Angular v17+.
const validateAngularVersion = function ({ failBuild }) {
  const version = getVersion('@angular/core')
  if (!version || !satisfies(version, '>=17.0.0')) {
    return failBuild(`This site does not seem to be using Angular 17.`)
  }
}

const getVersion = function (packageName) {
  try {
    // eslint-disable-next-line import/no-dynamic-require
    const { version } = require(`${packageName}/package.json`)
    return version
  } catch (error) {
    console.log(error)
  }
}

module.exports = validateAngularVersion
