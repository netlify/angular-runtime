const getAngularProjectName = ({ failBuild, angularJson }) => {
  const { defaultProject, projects } = angularJson

  if (defaultProject) {
    return defaultProject
  }

  const projectKeys = Object.keys(projects)

  if (projectKeys.length === 0) {
    return failBuild(`Could not find any projects within angular.json`)
  }

  if (projectKeys.length > 1) {
    return failBuild(
      `Could not determine the default project name, please add it to your angular.json as "defaultProject"`,
    )
  }

  return projectKeys[0]
}

module.exports = getAngularProjectName
