import { t } from 'gm-i18n'
import { observer } from 'mobx-react'
import React, { FC } from 'react'

import store from '../../stores/receipt_store1'
import { ColumnSortHeader } from '@/pages/sales_invoicing/components'

const CategroySortHeader = observer(() => {
  const { sortItem, sortProductList } = store
  return (
    <ColumnSortHeader
      title={t('商品分类')}
      field='category_name'
      sortItem={sortItem}
      sortProductList={sortProductList}
    />
  )
})

export default CategroySortHeader
