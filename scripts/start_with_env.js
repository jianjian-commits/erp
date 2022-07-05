/*
 * @Description: 根据不同的环境启动
 */
const getBranchUrl = require('./get_branch_url')
const shelljs = require('shelljs')

// 获取环境变量
const env = process.argv[2]
const PLACEHOLDER = 'GM_ENV'
const BASE_URL = `https://${PLACEHOLDER}.guanmai.cn/`
let replaceURL = 'x'

switch (env) {
  case 'master':
    break
  case 'lite':
    replaceURL = 'q'
    break
  default:
    replaceURL = 'env-'
    if (env === 'dev') {
      replaceURL += 'develop'
    } else {
      replaceURL += getBranchUrl()
    }
    replaceURL += '.x.k8s'
    break
}
const target = BASE_URL.replace(PLACEHOLDER, replaceURL)
process.env.GM_API_ENV = target

shelljs.exec('yarn start')
