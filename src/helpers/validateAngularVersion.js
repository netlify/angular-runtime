const { satisfies } = require('semver')

// Ensure site is using Angular v17+.
const validateAngularVersion = async function ({ run }) {
  const { stdout, exitCode } = await run('node', ['-p', "require('@angular/core/package.json').version"], {
    stdio: 'pipe',
  })
  if (exitCode !== 0) {
    console.warn('Could not determine Angular version. This package only supports Angular v17+.')
    return false
  }
  // adding -rc to allow prereleases of v17 as well
  const isValidVersion = satisfies(stdout, '^17.0.0-rc')
  if (!isValidVersion) {
    console.warn(`This site does not seem to be using Angular 17.`)
    return false
  }

  return true
}

module.exports = validateAngularVersion
