import React from 'react'
import { FullTabs } from '@gm-pc/frame'

import LendView from './lend_record'
import ReturnView from './return_record'

const tabs = [
  {
    text: '借出记录',
    value: 'lend',
    children: <LendView />,
  },
  {
    text: '归还记录',
    value: 'return',
    children: <ReturnView />,
  },
]

export default () => {
  return <FullTabs tabs={tabs} defaultActive='lend' />
}
