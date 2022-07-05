import { getFormatTimeForTable, toFixedByType } from '@/common/util'
import StockSheetLink from '@/pages/sales_invoicing/components/stock_sheet_link'
import { RECEIPT_TYPE, RECEIPT_TYPE_NAME } from '@/pages/sales_invoicing/enum'
import { BoxPanel, Price } from '@gm-pc/react'
import { Column, Table } from '@gm-pc/table-x'
import { t } from 'gm-i18n'
import React from 'react'
import store from '../store'

const columns: Column[] = [
  {
    Header: t('单据类型'),
    accessor: 'sheet_type',
    Cell: (cellProps) =>
      RECEIPT_TYPE_NAME[cellProps.original.sheet_type] ?? '-',
  },
  {
    Header: t('单据号'),
    accessor: 'stock_sheet_series_no',
    Cell: (cellProps) => {
      const {
        stock_sheet_id,
        stock_sheet_serial_no,
        sheet_status,
        sheet_type,
      } = cellProps.original
      const targetUrl =
        sheet_type === RECEIPT_TYPE.purchaseIn
          ? '/sales_invoicing/purchase/stock_in'
          : '/sales_invoicing/purchase/stock_out'
      return (
        <StockSheetLink
          url={targetUrl}
          sheetStatus={sheet_status}
          showText={stock_sheet_serial_no}
          stockSheetId={stock_sheet_id}
        />
      )
    },
  },
  {
    Header: t('入库/退货时间'),
    accessor: 'time',
    Cell: ({ original }) => {
      return getFormatTimeForTable('YYYY-MM-DD HH:mm', original.submit_time)
    },
  },
  {
    Header: t('入库/退货金额'),
    accessor: 'tax_total_price',
    Cell: ({ original }) => {
      return (
        toFixedByType(original.tax_total_price, 'dpInventoryAmount') +
          Price.getUnit() ?? '-'
      )
    },
  },
  {
    Header: t('入库/退货金额(不含税)'),
    accessor: 'total_price_no_tax',
    Cell: ({ original }) => {
      return (
        toFixedByType(original.total_price_no_tax, 'dpInventoryAmount') +
          Price.getUnit() ?? '-'
      )
    },
  },
  {
    Header: t('商品总金额'),
    accessor: 'product_total_price',
    Cell: ({ original }) => {
      return (
        toFixedByType(original.product_total_price, 'dpInventoryAmount') +
          Price.getUnit() ?? '-'
      )
    },
  },
  {
    Header: t('商品总金额(不含税)'),
    accessor: 'total_price',
    Cell: ({ original }) => {
      return (
        toFixedByType(original.total_price, 'dpInventoryAmount') +
          Price.getUnit() ?? '-'
      )
    },
  },
  {
    Header: t('税额'),
    accessor: 'tax_total_price',
    Cell: ({ original }) => {
      const { total_price, product_total_price } = original
      return (
        toFixedByType(
          Math.abs(product_total_price - total_price),
          'dpInventoryAmount',
        ) + Price.getUnit() ?? '-'
      )
    },
  },
]

const TransactionFlowTable = () => {
  const { relatedReceiptList } = store
  return (
    <BoxPanel
      title={t('单据列表')}
      summary={[{ text: t('合计'), value: relatedReceiptList.length }]}
      collapse
    >
      <Table isIndex data={relatedReceiptList.slice()} columns={columns} />
    </BoxPanel>
  )
}

export default TransactionFlowTable
