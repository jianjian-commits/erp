/*
 * @Description:获取分支名
 */
const execa = require('execa')

function getGitBranch() {
  const res = execa.commandSync('git rev-parse --abbrev-ref HEAD')
  return res.stdout
}

module.exports = getGitBranch
