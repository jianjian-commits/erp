import React, { FC } from 'react'
import { observer } from 'mobx-react'
import { toFixedSalesInvoicing } from '@/common/util'

import Big from 'big.js'
import globalStore from '@/stores/global'

interface Props {
  data: any
}

const TextAreaCell: FC<Props> = observer((props) => {
  const {
    data: {
      sku_base_unit_name,
      base_unit_quantity,
      sku_unit_quantity,
      sku_stock_quantity,
    },
  } = props

  return (
    <>
      {base_unit_quantity && (globalStore.isLite || sku_unit_quantity) && (
        <div>
          <span>
            {toFixedSalesInvoicing(
              Big(base_unit_quantity).plus(sku_stock_quantity),
            )}
            {sku_base_unit_name}
          </span>
        </div>
      )}
    </>
  )
})

export default TextAreaCell
