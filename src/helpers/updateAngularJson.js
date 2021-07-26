const { join } = require('path')

const { writeJsonSync } = require('fs-extra')

// Add necessary serverless script to angular.json
const updateAngularJson = function ({ failBuild, angularJson, projectName, siteRoot }) {
  if (!projectName) {
    return failBuild('No value defined for projectName. Check plugin inputs in netlify.toml.')
  }

  if (!angularJson.projects[projectName]) {
    return failBuild(`No project found in angular.json by the name of: ${projectName}.`)
  }

  try {
    angularJson.projects[projectName].architect.serverless = {
      builder: '@angular-devkit/build-angular:server',
      options: {
        outputPath: `dist/${projectName}/serverless`,
        main: 'serverless.ts',
        tsConfig: 'tsconfig.serverless.json',
      },
      configurations: {
        production: {
          outputHashing: 'media',
          fileReplacements: [
            {
              replace: 'src/environments/environment.ts',
              with: 'src/environments/environment.prod.ts',
            },
          ],
          sourceMap: false,
          optimization: true,
        },
      },
    }
    const angularJsonPath = join(siteRoot, 'angular.json')
    writeJsonSync(angularJsonPath, angularJson)
  } catch (error) {
    return failBuild(`Could not update angular.json with serverless project configuration`)
  }
}

module.exports = updateAngularJson
