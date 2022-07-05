import { t } from 'gm-i18n'
import { observer } from 'mobx-react'
import React, { FC } from 'react'

import store from '../../stores/receipt_store'
import { ColumnSortHeader } from '@/pages/sales_invoicing/components'

interface Props {
  isMerged?: boolean
}

const CategroySortHeader: FC<Props> = observer(({ isMerged }) => {
  const { sortItem, sortProductList, sortProductListMerged } = store
  return (
    <ColumnSortHeader
      title={t('商品分类')}
      field='category_name'
      sortItem={sortItem}
      sortProductList={isMerged ? sortProductListMerged : sortProductList}
    />
  )
})

export default CategroySortHeader
