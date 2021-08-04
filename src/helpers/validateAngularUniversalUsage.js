// Ensure site is using Angular Universal.
const validateAngularUniversalUsage = function ({ failBuild }) {
  if (!hasPackage('@nguniversal/express-engine')) {
    return failBuild(
      `This site does not seem to be using Angular Universal. Please run "ng add @nguniversal/express-engine" in the repository. See Angular docs for more information.`,
    )
  }
}

const hasPackage = function (packageName) {
  try {
    // eslint-disable-next-line import/no-dynamic-require
    require(`${packageName}/package.json`)
    return true
  } catch (error) {
    return false
  }
}

module.exports = validateAngularUniversalUsage
