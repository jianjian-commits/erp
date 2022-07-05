import { SortHeader } from '@gm-pc/table-x/src/components'
import { t } from 'gm-i18n'
import { observer } from 'mobx-react'
import React from 'react'

import store from '../../stores/receipt_store'

const ProductNameHeader = observer(() => {
  const { sort_by, sort_direction } = store.sortItem
  return (
    <span>
      {t('商品名称')}
      <SortHeader
        onChange={(direction) =>
          store.sortProductList({
            sort_by: 'sku_name',
            sort_direction: direction,
          })
        }
        type={sort_by === 'sku_name' ? sort_direction : null}
      />
    </span>
  )
})

export default ProductNameHeader
