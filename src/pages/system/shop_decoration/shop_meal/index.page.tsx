import React from 'react'
import { Tabs } from '@gm-pc/react'
import { t } from 'gm-i18n'
import { observer } from 'mobx-react'

import store from './store'
import Base from './base'
import ShopDecoration from './shop_decoration'
import MiniPrograme from './miniPrograme'
import MPPayInfoConfig from './miniPrograme/mp_payInfo_config'
import globalStore from '@/stores/global'

const BPage = observer(() => {
  const handleTabActive = (tab: string) => {
    store.changeActiveTab(tab)
  }

  return (
    <Tabs
      tabs={[
        {
          text: t('业务设置'),
          value: 'base',
          hide: globalStore.isLite,
          children: <Base />,
        },
        {
          text: t('店铺装修'),
          value: 'shop_decoration',
          children: <ShopDecoration />,
        },
        {
          text: t('小程序'),
          value: 'mp_manage',
          hide: globalStore.isLite,
          children:
            store.switch_mp_page === 1 ? <MiniPrograme /> : <MPPayInfoConfig />,
        },
      ]}
      defaultActive={globalStore.isLite ? 'shop_decoration' : 'base'}
      active={store.active_tab}
      onChange={(tab: string) => handleTabActive(tab)}
    />
  )
})

export default BPage
