import { Tabs } from '@gm-pc/react'
import { t } from 'gm-i18n'
import React from 'react'
import Shelf from './shelf'

export default function StockManagement() {
  const tabs = [
    {
      text: t('按货位查询'),
      value: 'shelf',
      children: <Shelf />,
    },
  ]

  return <Tabs light tabs={tabs} active='shelf' />
}
