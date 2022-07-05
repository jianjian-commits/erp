import React from 'react'
import { observer } from 'mobx-react'
import { Breadcrumb, Framework } from '@gm-pc/frame'
import { gmHistory as history, useGMLocation } from '@gm-common/router'

import getNavConfig, { IotConfig } from '../navigation'
import globalStore from '@/stores/global'
import type { BreadCrumbsItem } from '@gm-pc/frame'

const ComBreadcrumb = observer(() => {
  const location = useGMLocation()
  const { pathname } = location
  if (pathname === '/home') {
    return null
  }

  // 判断是否是IOT, 使用 IOT 面包屑
  const iot = /\/iot/
  const IsIot = iot.test(pathname)

  const handleSelect = (selected: BreadCrumbsItem) => {
    Framework.scrollTop()

    if (selected.link) {
      history.push(selected.link)
    }
  }

  return (
    <Breadcrumb
      breadcrumbs={globalStore.breadcrumbs.slice()}
      pathname={pathname}
      navConfig={IsIot ? IotConfig : getNavConfig()}
      onSelect={handleSelect}
    />
  )
})

export default ComBreadcrumb
