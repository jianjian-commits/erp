function validateBranch(branch) {
  if (branch === 'master') return true
  if (branch === 'develop') return true
  if (branch === 'litedev') return true
  if (branch.startsWith('release')) return true
  if (branch.startsWith('feature')) return true
  if (branch.startsWith('hotfix')) return true
  if (branch.startsWith('refactor')) return true
  if (branch.startsWith('ceres')) return true
  /** 灰度 release分支下通过gitlab_ci生成CI_COMMIT_REF_SLUG为v的版本 */
  if (branch.startsWith('v')) return true
  return false
}

function getSlugBranchName() {
  if (process.env.CI_COMMIT_REF_SLUG) {
    return process.env.CI_COMMIT_REF_SLUG
  } else {
    throw Error(`failed to find environment variable CI_COMMIT_REF_SLUG`)
  }
}
function getPublicPath() {
  if (process.env.NODE_ENV === 'development') return '/'
  const slugBranch = getSlugBranchName()
  const isValid = validateBranch(slugBranch)

  if (!isValid) {
    throw Error(`don't allow to release '${slugBranch}' branch`)
  }

  if (!process.env.PROJECT_ALIAS) {
    throw Error(`failed to find environment variable PROJECT_ALIAS`)
  }
  return `//txcdn.guanmai.cn/${process.env.PROJECT_ALIAS}/${slugBranch}/`
}

module.exports = {
  publicPath: getPublicPath(),
}
