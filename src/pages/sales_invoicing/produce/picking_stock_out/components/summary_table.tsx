import React from 'react'
import { Table, TableXUtil } from '@gm-pc/table-x'
import { RECEIPT_STATUS } from '@/pages/sales_invoicing/enum'

import { t } from 'gm-i18n'
import { DetailStore } from '../stores/index'

import { observer } from 'mobx-react'
import { TextAreaCell } from '@/pages/sales_invoicing/components'
import { ProductNameHeader, CategroySortHeader } from './product_detail'
import { quoteCommonColumn } from '@/pages/sales_invoicing/common_column_enum'

const { TABLE_X } = TableXUtil

const SummaryTable = observer(() => {
  const { productDetailsMerged, receiptDetail } = DetailStore

  const limit = 12
  const tableHeight =
    TABLE_X.HEIGHT_HEAD_TR +
    Math.min(limit, productDetailsMerged.length) * TABLE_X.HEIGHT_TR

  // 做一层记忆处理，若内部有值会变，需要放到第二个参数中
  const columns = [
    {
      Header: t('序号'),
      diyEnable: false,
      accessor: 'num',
      fixed: 'left',
      width: TABLE_X.WIDTH_NO,
      Cell: (cellProps: any) => {
        const { index } = cellProps.row
        return index + 1
      },
    },
    {
      Header: <ProductNameHeader />,
      accessor: 'sku_name',
      diyEnable: false,
      minWidth: 120,
    },
    {
      Header: <CategroySortHeader isMerged />,
      minWidth: 100,
      accessor: 'category',
      Cell: (cellProps: any) => {
        return <TextAreaCell data={cellProps.row.original} field='category' />
      },
    },
    {
      Header: t('当前库存（基本单位）'),
      minWidth: 100,
      accessor: 'currStockQuantity',
      show: receiptDetail.sheet_status === RECEIPT_STATUS.toBeSubmitted,
      Cell: (cellProps: any) => {
        return (
          <TextAreaCell
            field='currStockQuantity'
            data={cellProps.row.original}
          />
        )
      },
    },
    {
      Header: t('出库数（基本单位）'),
      diyEnable: false,
      accessor: 'base_quantity',
      minWidth: 140,
      Cell: (cellProps: any) => {
        const data = cellProps.row.original
        const quantity = data?.input_stock?.input?.quantity || 0
        return parseFloat(quantity) + data?.sku_base_unit_name
      },
    },
    quoteCommonColumn('MUTI_UNIT_DISPLAY', { type: 'detail' }),
    {
      Header: t('出库单价（基本单位）'),
      minWidth: 150,
      accessor: 'ssu_base_price',
      diyEnable: false,
      Cell: (cellProps: any) => {
        return (
          <TextAreaCell
            data={cellProps.row.original}
            field='ssu_base_price_compatible'
          />
        )
      },
    },

    {
      Header: t('出库成本'),
      accessor: 'amount',
      diyEnable: false,
      minWidth: 140,
      Cell: (cellProps: any) => {
        return (
          <TextAreaCell
            data={cellProps.row.original}
            field='amount_compatible'
          />
        )
      },
    },
  ]

  return (
    <Table
      isDiy
      isKeyboard
      isVirtualized
      virtualizedItemSize={TABLE_X.HEIGHT_TR}
      virtualizedHeight={tableHeight}
      id='picking_stock_out_summary_table'
      data={productDetailsMerged.slice()}
      isTrDisable={(item: any) => {
        return item.spu_status === 0
      }}
      columns={columns}
    />
  )
})

export default SummaryTable
