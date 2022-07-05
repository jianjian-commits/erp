import React, { FC } from 'react'
import { observer } from 'mobx-react'
import { Tabs } from '@gm-pc/react'

import store from './store'
import ViewByProduct from './view_by_product'
import ViewBySheet from './view_by_sheet'

const AgreementPrice: FC = observer(() => {
  const tabs = [
    {
      text: '按协议单查看',
      value: '1',
      children: <ViewBySheet />,
    },
    // {
    //   text: '按商品查看',
    //   value: '2',
    //   children: <ViewByProduct />,
    // },
  ]
  return (
    <>
      <Tabs
        tabs={tabs}
        active={store.tabActive}
        onChange={(value) => store.setTabActive(value)}
      />
    </>
  )
})

export default AgreementPrice
