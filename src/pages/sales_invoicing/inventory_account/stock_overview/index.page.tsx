import React from 'react'
import { FullTabsItem } from '@gm-pc/frame'
import { Tabs } from '@gm-pc/react'
import ViewOverView from './inventory_overview'
import ViewVirtual from './virtual_inventory'
import ViewShelf from './view_shelf'
import globalStore from '@/stores/global'
import ViewStock from './view_stock'

const tabs = [
  {
    text: '库存总览',
    value: 'overview',
    children: <ViewOverView />,
  },
  {
    text: '批次库存',
    value: 'stock',
    children: <ViewStock />,
  },
  {
    text: '货位库存',
    value: 'shelf',
    children: <ViewShelf />,
    hide: globalStore.isLite,
  },
  {
    text: '超支库存',
    value: 'virtual',
    children: <ViewVirtual />,
    hide: globalStore.isLite,
  },
].filter(Boolean) as FullTabsItem[]

export default () => {
  return <Tabs tabs={tabs} defaultActive='overview' />
}
