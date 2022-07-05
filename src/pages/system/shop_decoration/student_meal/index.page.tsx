import React from 'react'
// import { FullTabs } from '@gm-pc/frame'
// import { t } from 'gm-i18n'
// import BaseSetting from './base_setting'
// import ShopDecoration from './shop_decoration'
import NotificationPage from './notification_page/index'

export default () => {
  // const handleTabActive = (tab: string) => {
  //   store.changeActiveTab(tab)
  // }
  return (
    <NotificationPage />
    // <FullTabs
    //   tabs={[
    //     {
    //       text: t('基础设置'),
    //       value: 'base_setting',
    //       children: <BaseSetting />,
    //     },
    //     {
    //       text: t('店铺装修'),
    //       value: 'shop_decoration',
    //       children: <ShopDecoration />,
    //     },
    //   ]}
    //   defaultActive='base_setting'
    //   active={store.activeTab}
    //   onChange={(tab: string) => handleTabActive(tab)}
    // />
  )
}
