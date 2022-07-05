import React, { useState, useEffect } from 'react'
import { FullTabs } from '@gm-pc/frame'
import ViewStatement from './view_statement'
import ViewOrder from './view_order'
import { setTitle } from '@gm-common/tool'

export default () => {
  useEffect(() => {
    setTitle('商户结算')
  })
  return (
    <FullTabs
      tabs={[
        {
          text: '待处理订单',
          value: 'order',
          children: <ViewOrder />,
        },
        {
          text: '对账单',
          value: 'statement',
          children: <ViewStatement />,
        },
      ]}
      defaultActive='order'
    />
  )
}
