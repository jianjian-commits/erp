import React, { FC, memo } from 'react'
import { toFixedSalesInvoicing } from '@/common/util'

interface InputStockCellProps {
  index: number
  data: object
  type:
    | 'input_in.input'
    | 'input_in.input2'
    | 'input_out.input'
    | 'input_out.input2'
}

const InputStockCell: FC<InputStockCellProps> = memo(({ data, type }) => {
  const { sku_base_unit_name, transfer_status, in_stock } = data
  const isInStock = type.includes('input_in')
  let quantity = ''
  if (isInStock) {
    // 入库数展示取值
    quantity = in_stock?.base_unit?.quantity
  } else {
    // 出库数展示取值
    quantity = data?.input_out_stock?.input?.quantity
  }

  /*
   transfer_status < 2  说明 入库单还没有创建, 不需要 展示入库相关信息, 显示成 "-"
   transfer_status > = 2 , 说明调拨入库单已经创建, 这时候入库信息有效, 从input_in_stock获取数据信息并展示
   */

  return (
    <>
      {(() => {
        if (transfer_status < 2 && type.includes('input_in')) return '-'
        return (
          (quantity ? toFixedSalesInvoicing(quantity) : '-') +
          sku_base_unit_name
        )
      })()}
    </>
  )
})

export default InputStockCell
