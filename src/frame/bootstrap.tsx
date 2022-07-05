import React, { FC, useEffect, useState } from 'react'
import globalStore from '@/stores/global'
import { observer } from 'mobx-react'
import Login from '@/pages/login/index.page'
import { Storage } from '@gm-common/tool'
import { useLocation } from 'react-router'
import { accessTokenKey } from '@gm-common/x-request/src/util'
import { useGMLocation } from '@gm-common/router'

// 初始化数据
function doInit() {
  /* 重要数据 */
  // 站点信息
  globalStore.fetchStation()
  /* 不算重要的数据，慢点获取 */
  // setTimeout(() => {
  // 需要通过设置判断是否拉接口
  // 单位
  globalStore.fetchUnitList()
  // 进销存设置
  globalStore.fetchSalesInvoicingSetting()
  // 生产设置
  globalStore.fetchProductionSetting()
  // 商品设置
  globalStore.fetchShopSettings()
  globalStore.fetchShelf()
  // }, 500)
}

// 1 拉取用户信息接口，如果登录就进入主应用，如果不登录就去登录页面
// 2 跑fetchUserInfo会经过拦截器，存在token失效或者没token的提示问题，在此处处理
const Bootstrap: FC = observer(({ children }) => {
  const [loading, setLoading] = useState(true)
  const { pathname, key, search } = useLocation()
  const { query } = useGMLocation<any>()
  // 是否是分享路径
  const isSharePath = pathname.startsWith('/share')
  const isMiniProgram = pathname.includes('ForMiniProgram')
  useEffect(() => {
    const load = () => {
      globalStore.setIsBootstrap(true)
      setLoading(false)
    }
    if (isMiniProgram) {
      Storage.set(accessTokenKey, query.token)
      globalStore.fetchUserInfo().then(doInit).finally(load)
      return
    }
    if (Storage.get('ACCESS_TOKEN_KEY')) {
      if (isSharePath) {
        // 如果是分享的，不调用fetchUserInfo
        load()
      } else {
        // 否则走正常流程
        globalStore.fetchUserInfo().then(doInit).finally(load)
      }
    } else {
      setLoading(false)
    }
  }, [isSharePath, isMiniProgram])

  if (loading) {
    return <div />
  }

  const hasLogin =
    globalStore.userInfo.account_id && globalStore.userInfo.account_id !== '0'

  // // 路由是分享页，或者是ignorePath, 或者是小程序页面，不跳到login页面
  if (!isSharePath && !hasLogin && !isMiniProgram) {
    return <Login />
  }

  return <>{children}</>
})

export default Bootstrap
