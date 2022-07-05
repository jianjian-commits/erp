import React, { FC, useMemo } from 'react'
import { Flex, Nav, NavSingleItem } from '@gm-pc/react'
import { gmHistory as history, useGMLocation } from '@gm-common/router'
import { Framework, Left } from '@gm-pc/frame'
import defaultLogo from '../../img/enter_logo.png'
import IOT from '../../img/IOT.png'
import getNavConfig, { IotConfig } from '../navigation'
import globalStore from '@/stores/global'
import SVG_kh from '@/svg/nav/kh.svg'
import SVG_kh_active from '@/svg/nav/kh_active.svg'
import { t } from 'gm-i18n'
import _ from 'lodash'
import SystemMenu from '@/frame/component/system_menu'

const Logo = React.memo(() => {
  const path = globalStore.getUserLogo()
  return (
    <Flex
      alignCenter
      justifyCenter
      style={{
        width: '100%',
        height: '100%',
        boxShadow: '1px 0px 0px 0px #E8ECF3',
      }}
    >
      <a href='#/' style={{ width: '100%', height: '100%' }}>
        <img
          src={path ? `https://qncdn.guanmai.cn/${path}` : defaultLogo}
          style={{
            width: '100%',
            height: '100%',
          }}
        />
      </a>
    </Flex>
  )
})

const FooterImage = () => {
  return (
    <img
      src={IOT}
      style={{
        height: '64px',
        width: '100%',
      }}
    />
  )
}

const Admin = React.memo(() => {
  const location = useGMLocation()
  const { pathname } = location
  const selected = `/${pathname.split('/')[1]}`
  const handleSelect = (selected: { link: string }) => {
    Framework.scrollTop()
    history.push(selected.link)
  }
  const adminNavConfig = [
    {
      link: '/user_manage',
      name: t('账号'),
      icon: <SVG_kh />,
      iconActive: <SVG_kh_active />,
    },
    {
      link: '/role_manage',
      name: t('角色'),
      icon: <SVG_kh />,
      iconActive: <SVG_kh_active />,
      hide: globalStore.isLite,
    },
  ]
  return (
    <Flex column>
      {_.map(adminNavConfig, (item, index) => {
        if (item.hide) return null
        return (
          <NavSingleItem
            key={index}
            data={item}
            selected={selected}
            onSelect={handleSelect}
          />
        )
      })}
    </Flex>
  )
})

const roleManageURL = /\/role_manage/
const userManageURL = /\/user_manage/

/* 渲染 SystemMenu 菜单的路由匹配规则  */
const SETTING_PAGES_REG = [/\/system/, userManageURL, roleManageURL]

/** 需要点击跳到一个新的页面的路由，方便后期扩展 */
const openNewTagRoutes = ['/order/order_manage/create']

const Menu: FC = () => {
  const location = useGMLocation()
  const { pathname } = location

  const handleSelect = (selected: { link: string }) => {
    Framework.scrollTop()

    history.push(selected.link)
  }

  const handlePushCreate = (selected: any) => {
    if (selected.toCreate.disabled) return
    Framework.scrollTop()
    if (openNewTagRoutes.includes(selected.toCreate.href)) {
      window.open(`#${selected.toCreate.href}`)
      return
    }
    history.push(selected.toCreate.href)
  }

  const inAdminPage =
    roleManageURL.test(pathname) || userManageURL.test(pathname)

  const IsSetting = useMemo(() => {
    return SETTING_PAGES_REG.some((rule) => rule.test(pathname))
  }, [pathname])

  return (
    <Left>
      {IsSetting ? (
        <SystemMenu />
      ) : (
        <Nav
          logo={<Logo />}
          data={globalStore.isAdmin() && inAdminPage ? [] : getNavConfig()}
          onSelect={handleSelect}
          onPushCreate={handlePushCreate}
          selected={pathname}
          other={globalStore.isAdmin() && inAdminPage ? <Admin /> : null}
          footerImage={<FooterImage />}
          footerConfig={
            // 用户管理页 || 轻巧版 隐藏底部数据
            (globalStore.isAdmin() && inAdminPage) || globalStore.isLite
              ? []
              : IotConfig
          }
        />
      )}
    </Left>
  )
}

export default React.memo(Menu)
