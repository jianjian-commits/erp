import React from 'react'
import { Tabs } from '@gm-pc/react'

import ViewPurchase from './list/stock_in_purchase'
import ViewProcess from './list/stock_in_process'
import ViewMaterial from './list/stock_in_material'
import ViewSale from './list/stock_in_sale'
import ViewProfit from './list/stock_in_profit'
import ViewOther from './list/stock_in_other'
import ViewTransfer from './list/stock_in_transfer'
import globalStore from '@/stores/global'

const tabs = [
  {
    text: '采购入库',
    value: 'purchase',
    children: <ViewPurchase />,
  },
  {
    text: '生产入库',
    value: 'process',
    hide: globalStore.isLite,
    children: <ViewProcess />,
  },
  {
    text: '退料入库',
    value: 'material',
    hide: globalStore.isLite,
    children: <ViewMaterial />,
  },
  {
    text: '销售退货入库',
    value: 'sale',
    hide: globalStore.isLite,
    children: <ViewSale />,
  },
  {
    text: '盘盈入库',
    value: 'profit',
    children: <ViewProfit />,
  },
  {
    text: '其他入库',
    value: 'other',
    hide: globalStore.isLite,
    children: <ViewOther />,
  },
  {
    text: '移库入库',
    value: 'transfer',
    hide: globalStore.isLite,
    children: <ViewTransfer />,
  },
]

export default () => {
  return <Tabs tabs={tabs} defaultActive='purchase' />
}
