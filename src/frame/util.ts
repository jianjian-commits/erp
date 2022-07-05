import _ from 'lodash'
import { t } from 'gm-i18n'
import { isPathMatch, setTitle } from '@gm-common/tool'
import { NavConfigProps } from './type'
import { LITE_VERSION_LINKS } from './navigation'
import globalStore from '@/stores/global'

const getAppTitle = (pathname: string, navConfig: NavConfigProps[]) => {
  // 三级确定匹配一个模块
  const result: any = []
  _.forEach(navConfig, (value) => {
    if (_.startsWith(pathname, value?.link)) {
      _.forEach(value?.sub, (val) => {
        _.forEach(val.sub, (v) => {
          if (isPathMatch(pathname, v.link)) {
            result.push(value)
            result.push(val)
            result.push(v)
          }
        })
      })
    }
  })

  return result.length ? result[result.length - 1].name : ''
}

let preTitle = ''

const setAppTitle = (
  pathname: string,
  breadcrumbs: string[],
  navConfig: NavConfigProps[],
) => {
  let title = ''
  if (pathname === '/home') {
    title = t('首页')
  } else if (breadcrumbs.length) {
    title = breadcrumbs[breadcrumbs.length - 1]
  } else {
    title = getAppTitle(pathname, navConfig)
  }

  if (title !== preTitle) {
    preTitle = title
    setTitle(title)
  }
}

function processNavConfig(navConfig: NavConfigProps[]): NavConfigProps[] {
  return _.filter(navConfig, (item) => {
    if (item === null || item === undefined) {
      return false
    }

    if (item.disabled) {
      if (_.isFunction(item.disabled)) {
        return !item.disabled(item)
      } else {
        return !item.disabled
      }
    }
    if (globalStore.isLite && !LITE_VERSION_LINKS.includes(item.link)) {
      return false
    }
    if (item.sub) {
      // @ts-ignore
      item.sub = processNavConfig(item.sub)
    }

    // 如果没有了也应该移除
    if (item.sub && item.sub.length === 0) {
      return false
    }

    return true
  })
}

export { getAppTitle, setAppTitle, processNavConfig }
