import React from 'react'
import ViewOrder from './view_order'
import ViewSku from './view_sku'
import ViewCombine from './view_combine'
import ViewCoverSku from './view_cover_sku'
import globalStore from '@/stores/global'
import { Tabs } from '@gm-pc/react'
import { Permission } from 'gm_api/src/enterprise'

type OrderTabs = 'order' | 'sku' | 'combine' | 'coverSku'

export default () => {
  return (
    <Tabs<OrderTabs>
      tabs={[
        {
          text: '按订单查看',
          value: 'order',
          children: <ViewOrder />,
        },
        {
          text: '按商品查看',
          value: 'sku',
          children: <ViewSku />,
        },
        {
          text: '按套账商品查看',
          value: 'coverSku',
          children: <ViewCoverSku />,
          hide:
            !globalStore.hasPermission(
              Permission.PERMISSION_ORDER_FAKE_ORDER_RELATED_FIELDS,
            ) || globalStore.isLite,
        },
        {
          text: '按组合商品查看',
          value: 'combine',
          children: <ViewCombine />,
          hide: globalStore.isLite,
        },
      ]}
      defaultActive='order'
    />
  )
}
