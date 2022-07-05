import React from 'react'
import { Tabs } from '@gm-pc/react'

import ViewSale from './list/stock_out_sale'
import ViewMaterial from './list/stock_out_material'
import ViewRefund from './list/stock_out_refund'
import ViewLoss from './list/stock_out_loss'
import ViewOther from './list/stock_out_other'
import ViewTransfer from './list/stock_out_transfer'
import globalStore from '@/stores/global'

const tabs = [
  {
    text: '销售出库',
    value: 'sale',
    children: <ViewSale />,
  },
  {
    text: '领料出库',
    value: 'material',
    hide: globalStore.isLite,
    children: <ViewMaterial />,
  },
  {
    text: '采购退货出库',
    value: 'refund',
    hide: globalStore.isLite,
    children: <ViewRefund />,
  },
  {
    text: '盘亏出库',
    value: 'loss',
    children: <ViewLoss />,
  },
  {
    text: '其他出库',
    value: 'other',
    hide: globalStore.isLite,
    children: <ViewOther />,
  },
  {
    text: '移库出库',
    value: 'transfer',
    hide: globalStore.isLite,
    children: <ViewTransfer />,
  },
]

export default () => {
  return <Tabs tabs={tabs} defaultActive='sale' />
}
