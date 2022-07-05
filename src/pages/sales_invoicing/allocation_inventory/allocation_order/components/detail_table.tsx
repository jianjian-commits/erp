import React, { useCallback } from 'react'
import { BoxPanel, Price } from '@gm-pc/react'
import { TableXUtil, Table, Column } from '@gm-pc/table-x'
import { t } from 'gm-i18n'
import store from '../stores/receipt_store'
import { observer } from 'mobx-react'
import TableRight from '@/common/components/key_board_tips'
import { InputStockCell } from './product_detail'
import { checkDigit, getUnNillText, toFixedByType } from '@/common/util'
import { TextAreaCell } from '@/pages/sales_invoicing/components'
import { COMMON_COLUMNS } from '@/common/enum'
import { RECEIPT_STATUS } from '@/pages/sales_invoicing/enum'
import {
  quoteCommonColumn,
  sortHeader,
} from '@/pages/sales_invoicing/common_column_enum'

const { TABLE_X } = TableXUtil

const EditDetail = observer(() => {
  const { productDetails, receiptDetail } = store

  const handleDetailAdd = useCallback(() => {
    !checkDigit(receiptDetail.status, 8) && store.addProductDetailsItem()
  }, [receiptDetail.status])

  const limit = 12
  const tableHeight =
    TABLE_X.HEIGHT_HEAD_TR +
    Math.min(limit, productDetails.length) * TABLE_X.HEIGHT_TR

  const columns: Column[] = [
    {
      Header: t('序号'),
      diyEnable: false,
      accessor: 'num',
      fixed: 'left',
      width: TABLE_X.WIDTH_NO,
      Cell: (cellProps: any) => {
        const { index } = cellProps
        return index + 1
      },
    },
    {
      Header: sortHeader(
        {
          title: t('商品名称'),
          field: 'sku.name',
        },
        store,
      ),
      diyItemText: t('商品名称'),
      accessor: 'sku_id',
      diyEnable: false,
      minWidth: 200,
      isKeyboard: !checkDigit(receiptDetail.status, 8),
      Cell: (cellProps: any) => {
        const { sku } = cellProps.original
        return <>{getUnNillText(sku?.name)}</>
      },
    },
    COMMON_COLUMNS.SKU_BASE_UNIT_NAME,
    {
      Header: sortHeader(
        {
          title: t('商品分类'),
          field: 'sku.categoryName',
        },
        store,
      ),
      diyItemText: t('商品分类'),
      minWidth: 130,
      accessor: 'category',
      Cell: (cellProps: any) => {
        const {
          sku: { category_name },
        } = cellProps.original
        return category_name || '-'
      },
    },
    {
      Header: t('当前库存（基本单位）'),
      minWidth: 100,
      accessor: 'currStockQuantity',
      show: receiptDetail.status === RECEIPT_STATUS.toBeSubmitted,
      Cell: (cellProps: any) => {
        const data = cellProps.original
        return <TextAreaCell data={data} field='currStockQuantity' />
      },
    },
    quoteCommonColumn(
      'CURRENT_STOCK',
      { type: 'add' },
      {
        show: receiptDetail.status === RECEIPT_STATUS.toBeSubmitted,
      },
    ),
    {
      Header: t('出库数（基本单位）'),
      diyEnable: false,
      isKeyboard: !checkDigit(receiptDetail.status, 8),
      accessor: 'ssu_base_quantity',
      minWidth: 140,
      Cell: (cellProps: any) => {
        return (
          <InputStockCell
            data={cellProps?.original}
            index={cellProps.index}
            type='input_out.input'
          />
        )
      },
    },
    /** 入库数(辅助单位) */
    quoteCommonColumn(
      'SECOND_QUANTITY',
      {},
      { Header: t('出库数（辅助单位）') },
    ),
    quoteCommonColumn('MUTI_UNIT_DISPLAY', { type: 'add' }),
    {
      Header: t('出库单价'),
      minWidth: 120,
      accessor: 'out_stock_price',
      diyEnable: false,
      Cell: (cellProps: any) => {
        const { out_stock_price } = cellProps.original
        return out_stock_price
          ? toFixedByType(out_stock_price, 'order') + Price.getUnit()
          : '-'
      },
    },
    {
      Header: t('出库成本'),
      minWidth: 120,
      accessor: 'out_stock_amount',
      diyEnable: false,
      Cell: (cellProps: any) => {
        const { out_stock_amount } = cellProps.original
        return out_stock_amount ? out_stock_amount + Price.getUnit() : '-'
      },
    },
    {
      Header: t('入库数（基本单位）'),
      accessor: 'input_in_stock',
      minWidth: 140,
      Cell: (cellProps: any) => {
        return (
          <InputStockCell
            data={cellProps?.original}
            index={cellProps.index}
            type='input_in.input'
          />
        )
      },
    },
    {
      Header: t('入库单价'),
      minWidth: 120,
      accessor: 'in_stock_price',
      diyEnable: false,
      Cell: (cellProps: any) => {
        const { in_stock_price } = cellProps.original
        return in_stock_price
          ? toFixedByType(in_stock_price, 'order') + Price.getUnit()
          : '-'
      },
    },
    {
      Header: t('入库成本'),
      minWidth: 120,
      accessor: 'in_stock_amount',
      diyEnable: false,
      Cell: (cellProps: any) => {
        const { in_stock_amount } = cellProps.original
        return in_stock_amount ? in_stock_amount + Price.getUnit() : '-'
      },
    },
    {
      Header: t('商品备注'),
      accessor: 'remark',
      minWidth: 170,
      isKeyboard: true,
      Cell: (cellProps: any) => {
        return <TextAreaCell data={cellProps.row.original} field='remark' />
      },
    },
  ]

  return (
    <BoxPanel title={t('商品明细')} collapse right={<TableRight />}>
      <Table
        isEdit
        isKeyboard
        keyField='uniqueKey'
        onAddRow={handleDetailAdd}
        virtualizedItemSize={TABLE_X.HEIGHT_TR}
        virtualizedHeight={tableHeight}
        id='allocation_sheet_order'
        data={productDetails.slice()}
        isTrDisable={(item: any) => {
          return item.spu_status === 0
        }}
        fixedSelect
        columns={columns}
        batchActionBarPure
      />
    </BoxPanel>
  )
})

export default EditDetail
