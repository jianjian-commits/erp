import React, { FC } from 'react'
import { gmHistory } from '@gm-common/router'
import { StockSheet_SheetType, OperateType } from 'gm_api/src/inventory/types'
import { RECEIPT_TYPE, RECEIPT_TYPE_NAME, OPERATE_TYPE_NAME } from '../enum'

interface Props {
  source_type: StockSheet_SheetType
  operate_type?: OperateType
  serial_no: string
  sheet_id: string
  showName?: boolean
  isActive?: boolean
}

const getSheetHref = (sheet_type: StockSheet_SheetType) => {
  let href = ''
  switch (sheet_type) {
    // 采购入库
    case RECEIPT_TYPE.purchaseIn:
      href = 'purchase/stock_in'
      break
    // 生产入库
    case RECEIPT_TYPE.productIn:
      href = 'produce/produce_stock_in'
      break
    // 退料入库
    case RECEIPT_TYPE.materialIn:
      href = 'produce/refund_stock_in'
      break
    // 销售退货入库
    case RECEIPT_TYPE.saleRefundIn:
      href = 'sales/stock_in'
      break
    // 其他入库
    case RECEIPT_TYPE.otherIn:
      href = 'other_stock/stock_in'
      break
    // 销售出库
    case RECEIPT_TYPE.saleOut:
      href = 'sales/stock_out'
      break
    // 领料出库
    case RECEIPT_TYPE.materialOut:
      href = 'produce/picking_stock_out'
      break
    // 采购退货出库
    case RECEIPT_TYPE.purchaseRefundOut:
      href = 'purchase/stock_out'
      break
    // 其他出库
    case RECEIPT_TYPE.otherOut:
      href = 'other_stock/stock_out'
      break
    // 盘点单
    case RECEIPT_TYPE.inventory:
      href = 'inventory_check/manage'
      break
    // 移库单
    case RECEIPT_TYPE.transfer:
      href = 'inventory_check/transfer'
      break
    // 调拨出库单
    case RECEIPT_TYPE.transferIn:
      href = 'allocation_inventory/allocation_stock_in'
      break
    // 调拨入库单
    case RECEIPT_TYPE.transferOut:
      href = 'allocation_inventory/allocation_stock_out'
      break
  }
  return href
}

const ToSheet: FC<Props> = (props) => {
  const { source_type, sheet_id, serial_no, operate_type, showName } = props
  const href = getSheetHref(source_type as StockSheet_SheetType)

  const SheetNo = () => {
    if (
      [RECEIPT_TYPE.turnoverLoan, RECEIPT_TYPE.turnoverRevert].includes(
        source_type,
      )
    ) {
      return '-'
    }
    if (source_type === StockSheet_SheetType.SHEET_TYPE_REFUND_IN) {
      return (
        <a
          className='gm-text-primary gm-cursor'
          href={`#/sales_invoicing/${href}?serial_no=${serial_no}`}
        >
          {serial_no}
        </a>
      )
    }
    return (
      <a
        className='gm-text-primary gm-cursor'
        href={`#/sales_invoicing/${href}/detail?sheet_id=${sheet_id}`}
      >
        {serial_no}
      </a>
    )
  }

  return (
    <>
      {showName && (
        <div>
          {operate_type
            ? OPERATE_TYPE_NAME[operate_type!]
            : RECEIPT_TYPE_NAME[source_type]}
        </div>
      )}
      {SheetNo()}
    </>
  )
}

export default ToSheet

export const toSheetF = (
  sheet_type: StockSheet_SheetType,
  stock_sheet_id: string,
) => {
  const href = getSheetHref(sheet_type)
  gmHistory.push(`/sales_invoicing/${href}/detail?sheet_id=${stock_sheet_id}`)
}
