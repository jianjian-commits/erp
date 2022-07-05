import React, { FC } from 'react'
import { observer } from 'mobx-react'
import { toFixedSalesInvoicing } from '@/common/util'
import _ from 'lodash'
import Big from 'big.js'

interface Props {
  data: any
}

const TextAreaCell: FC<Props> = observer((props) => {
  const {
    data: {
      ssu_unit_name,
      ssu_base_unit_name,
      base_unit_quantity,
      sku_unit_quantity,
      sku_stock_quantity,
      ssu_stock_quantity,
    },
  } = props
  return (
    <>
      {base_unit_quantity && sku_unit_quantity && (
        <div>
          <span>
            {toFixedSalesInvoicing(
              Big(base_unit_quantity).plus(sku_stock_quantity),
            )}
            {ssu_base_unit_name}
          </span>
          <span>/</span>
          <span>
            {toFixedSalesInvoicing(
              Big(sku_unit_quantity).plus(ssu_stock_quantity),
            )}
            {ssu_unit_name}
          </span>
        </div>
      )}
    </>
  )
})

export default TextAreaCell
