import React, { FC } from 'react'
import { observer } from 'mobx-react'
import { toFixedOrder } from '@/common/util'
import { CellPropsWidthOriginal } from '@/pages/order/order_manage/components/detail/list/interface'
import Big from 'big.js'

interface CellRealQuantityProps extends CellPropsWidthOriginal {
  index: number
}
const CellRealQuantity: FC<CellRealQuantityProps> = observer(
  ({ sku, index }) => {
    return <>{toFixedOrder(Big(sku.std_quantity || 0)) + sku.unit.name}</>
  },
)

export default CellRealQuantity
