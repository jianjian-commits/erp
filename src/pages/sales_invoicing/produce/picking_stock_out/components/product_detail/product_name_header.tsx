import React from 'react'
import { observer } from 'mobx-react'
import { SortHeader } from '@gm-pc/table-x/src/components'
import { t } from 'gm-i18n'

import { DetailStore } from '../../stores/index'

const ProductNameHeader = observer(() => {
  const { sort_by, sort_direction } = DetailStore.sortItem
  return (
    <span>
      {t('商品名称')}
      <SortHeader
        onChange={(direction) =>
          DetailStore.sortProductList({
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
