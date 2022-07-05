import React, { FC } from 'react'

import { PENDING_TYPE, PENDING_TYPE_NAME } from '@/pages/sales_invoicing/enum'

interface Props {
  pending_type: number
  serial_no: string
  sheet_id: number
}

const ToSheet: FC<Props> = (props) => {
  const { pending_type, sheet_id, serial_no } = props
  let href = ''
  switch (pending_type) {
    // 采购入库
    case PENDING_TYPE.purchaseIn:
      href = 'purchase/stock_in'
      break
    // 生产入库
    case PENDING_TYPE.productIn:
      href = 'produce/produce_stock_in'
      break
    // 领料出库
    case PENDING_TYPE.materialOut:
      href = 'produce/picking_stock_out'
      break
    // 销售出库
    case PENDING_TYPE.saleOut:
      href = 'sales/stock_out'
      break
  }

  return (
    <>
      <div>{PENDING_TYPE_NAME[pending_type]}</div>
      <a
        className='gm-text-primary gm-cursor'
        href={`#/sales_invoicing/${href}/detail?sheet_id=${sheet_id}`}
      >
        {serial_no}
      </a>
    </>
  )
}

export default ToSheet
