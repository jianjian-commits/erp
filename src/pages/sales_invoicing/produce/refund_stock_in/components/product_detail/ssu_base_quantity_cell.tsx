import React, { FC } from 'react'
import { observer } from 'mobx-react'
import { PDetail } from '../../stores/receipt_store'
import { toFixedSalesInvoicing } from '@/common/util'

interface Props {
  data: PDetail
  index: number
}

const SsuBaseQuantityCell: FC<Props> = observer((props) => {
  const { data } = props
  const {
    sku_base_unit_name,
    input_stock: { input },
  } = data

  return (
    <>
      <span>
        {(input?.quantity ? toFixedSalesInvoicing(+input?.quantity) : '-') +
          (sku_base_unit_name || '-')}
      </span>
    </>
  )
})

export default SsuBaseQuantityCell
