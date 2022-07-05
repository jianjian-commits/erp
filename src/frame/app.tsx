import React, { FC, ReactElement, useEffect, useMemo } from 'react'
import globalStore from '@/stores/global'
import { useLocation } from 'react-router'
import { gmHistory as history } from '@gm-common/router'
import { Framework, RightTop } from '@gm-pc/frame'
import { isFullScreen } from '@/common/service'
import Menu from './component/menu'
import ComBreadcrumb from './component/breadcrumb'
import { setAppTitle } from './util'
import getNavConfig from './navigation'
import Info from './component/info'
import TaskPanel from '@/common/components/async_task'
import Affix from './component/Affix'
import { Button } from 'antd'

const Child: FC = React.memo(({ children }) => {
  const { pathname, search } = useLocation()

  return React.cloneElement(children as ReactElement, {
    key: pathname + search,
  })
})

const AutoTitle = React.memo(() => {
  const { pathname } = useLocation()
  useEffect(() => {
    setAppTitle(pathname, globalStore.breadcrumbs.slice(), getNavConfig())
  }, [pathname])

  return null
})

const handleBackHome = () => {
  history.push('/home')
}

/* 渲染 SystemMenu 菜单的路由匹配规则  */
const SETTING_PAGES_REG = [/\/system/, /\/user_manage/, /\/role_manage/]

const App: FC = ({ children }) => {
  const { pathname } = useLocation()

  const full = isFullScreen(pathname)

  const IsSetting = useMemo(() => {
    return SETTING_PAGES_REG.some((rule) => rule.test(pathname))
  }, [pathname])

  return (
    <Framework
      className={IsSetting ? 'gm-system-setting-special' : ''}
      isFullScreen={full}
      menu={<Menu />}
      rightTop={
        <RightTop
          breadcrumb={
            IsSetting ? (
              <Button
                type='primary'
                ghost
                className='gm-system-button'
                onClick={handleBackHome}
              >
                返回系统主页
              </Button>
            ) : (
              <ComBreadcrumb />
            )
          }
          info={IsSetting ? null : <Info />}
        />
      }
    >
      <AutoTitle />
      <Child>{children}</Child>
      {pathname !== '/login' && !full && !IsSetting && <Affix />}
      <TaskPanel />
    </Framework>
  )
}

export default App
