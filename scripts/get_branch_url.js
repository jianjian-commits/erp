/*
 * @Description:获取分支url，会将 '/', '_'转换为 '-'
 */
const getGitBranch = require('./get_branch')

function getBranchUrl() {
  const gitBranch = getGitBranch()
  return gitBranch.replace(/[_\\/]/g, '-')
}
module.exports = getBranchUrl
