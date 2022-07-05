import React, { FC } from 'react'
import { observer } from 'mobx-react'
import { t } from 'gm-i18n'
import { Tabs } from '@gm-pc/react'

import {
  CategroyBySku,
  CategroyByPurchaser,
  CategroyBySupplier,
} from './components'

import { PurchaseFormsType } from 'gm_api/src/inventory'

const PurchaseOutIn: FC<{}> = observer(() => {
  const tabs = [
    {
      value: PurchaseFormsType.TYPE_MERCHANDISE,
      text: t('按商品'),
      children: <CategroyBySku />,
    },
    {
      value: PurchaseFormsType.TYPE_SUPPLIER,
      text: t('按供应商'),
      children: <CategroyBySupplier />,
    },
    {
      value: PurchaseFormsType.TYPE_PURCHASER,
      text: t('按采购员'),
      children: <CategroyByPurchaser />,
    },
  ]

  return (
    <Tabs
      tabs={tabs}
      defaultActive={PurchaseFormsType.TYPE_MERCHANDISE}
      className='tw-box-border'
    />
  )
})

export default PurchaseOutIn
