const camelCase = require("lodash.camelcase")

const ACMS_API_VAR_PREFIX = "ACMS_API_VAR_"

const variablesToValues = Object.entries(process.env)
  .filter(([key]) => key.startsWith(ACMS_API_VAR_PREFIX))
  .map(([key, value]) => [new RegExp(`\\$\{${camelCase(key.substr(ACMS_API_VAR_PREFIX.length))}}`, "g"), value])

const valuesToVariables = Object.entries(process.env)
  .filter(([key]) => key.startsWith(ACMS_API_VAR_PREFIX))
  .map(([key, value]) => [new RegExp(value, "g"), `$\{${camelCase(key.substr(ACMS_API_VAR_PREFIX.length))}}`])

module.exports.replaceVariablesWithValues = content =>
  variablesToValues.reduce((result, [regExp, val]) => result.replace(regExp, val), content)

module.exports.replaceValuesWithVariables = content =>
  valuesToVariables.reduce((result, [regExp, val]) => result.replace(regExp, val), content)
