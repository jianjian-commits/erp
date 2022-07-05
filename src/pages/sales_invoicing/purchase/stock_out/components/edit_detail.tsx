import React, { useCallback } from 'react'
import { BoxPanel } from '@gm-pc/react'
import { TableXUtil, Table, Column } from '@gm-pc/table-x'

import { t } from 'gm-i18n'
import store from '../stores/receipt_store'
import { observer } from 'mobx-react'
import TableRight from '@/common/components/key_board_tips'
import {
  ProductNameCell,
  OperationCell,
  BatchDetailCell,
  TaxRateCell,
} from './product_detail'

import { TextAreaCell } from '@/pages/sales_invoicing/components'
import RemarkCell from '@/pages/sales_invoicing/purchase/stock_out/components/product_detail/remake_cell'
import { COMMON_COLUMNS } from '@/common/enum'
import {
  quoteCommonColumn,
  sortHeader,
  BaseQuantityColumn,
} from '@/pages/sales_invoicing/common_column_enum'

const { OperationHeader, TABLE_X } = TableXUtil

const EditDetail = observer(() => {
  const { productDetails, receiptDetail, changeProductDetailsItem } = store
  const { warehouse_id } = receiptDetail

  const handleDetailAdd = useCallback(() => {
    store.addProductDetailsItem()
  }, [])

  // 做一层记忆处理，若内部有值会变，需要放到第二个参数中
  const columns: Column[] = React.useMemo(() => {
    return [
      COMMON_COLUMNS.INDEX,
      {
        Header: OperationHeader,
        accessor: 'action',
        diyEnable: false,
        diyItemText: t('操作'),
        fixed: 'left',
        width: TABLE_X.WIDTH_EDIT_OPERATION,
        Cell: (cellProps) => {
          return (
            <OperationCell index={cellProps.index} onAddRow={handleDetailAdd} />
          )
        },
      },
      {
        Header: sortHeader(
          {
            title: t('商品名称'),
            field: 'sku_name',
          },
          store,
        ),
        diyItemText: t('商品名称'),
        accessor: 'name',
        diyEnable: false,
        minWidth: 200,
        isKeyboard: true,
        Cell: (cellProps) => {
          return (
            <ProductNameCell
              index={cellProps.index}
              data={cellProps.original}
            />
          )
        },
      },
      // 基本单位
      COMMON_COLUMNS.SKU_BASE_UNIT_NAME,
      {
        Header: sortHeader(
          {
            title: t('商品分类'),
            field: 'category_name',
          },
          store,
        ),
        diyItemText: t('商品分类'),
        minWidth: 100,
        accessor: 'category',
        Cell: (cellProps) => {
          return <TextAreaCell data={cellProps.original} field='category' />
        },
      },
      {
        Header: t('当前库存（基本单位）'),
        minWidth: 100,
        accessor: 'currStockQuantity',
        Cell: (cellProps) => {
          return (
            <TextAreaCell field='currStockQuantity' data={cellProps.original} />
          )
        },
      },
      quoteCommonColumn('CURRENT_STOCK', { type: 'add' }),
      {
        Header: t('可用库存'),
        minWidth: 100,
        accessor: '',
        Cell: (cellProps) => {
          return (
            <TextAreaCell field='currStockQuantity' data={cellProps.original} />
          )
        },
      },
      // 基本单位 & 辅助单位
      ...BaseQuantityColumn(
        {
          title: '出库数',
          is_replace: false,
        },
        changeProductDetailsItem,
      ),
      quoteCommonColumn('MUTI_UNIT_DISPLAY', { type: 'add' }),
      {
        Header: t('出库批次'),
        accessor: 'batch_serial_no',
        minWidth: 90,
        Cell: (cellProps) => {
          return (
            <BatchDetailCell
              index={cellProps.index}
              data={cellProps.original}
              warehouseId={warehouse_id}
            />
          )
        },
      },
      {
        Header: t('出库单价'),
        minWidth: 150,
        accessor: 'ssu_base_price_edit',
        diyEnable: false,
        isKeyboard: true,
        Cell: (cellProps) => {
          return (
            <TextAreaCell
              field='ssu_base_price_edit'
              index={cellProps.index}
              data={cellProps.original}
            />
          )
        },
      },
      {
        Header: t('不含税出库单价'),
        minWidth: 150,
        accessor: 'no_tax_base_price_edit',
        diyEnable: false,
        isKeyboard: true,
        Cell: (cellProps) => {
          return (
            <TextAreaCell
              field='no_tax_base_price_edit'
              index={cellProps.index}
              data={cellProps.original}
            />
          )
        },
      },
      {
        Header: t('出库金额'),
        accessor: 'amount_edit',
        diyEnable: false,
        isKeyboard: true,
        minWidth: 140,
        Cell: (cellProps) => {
          return (
            <TextAreaCell
              field='amount_edit'
              index={cellProps.index}
              data={cellProps.original}
            />
          )
        },
      },
      {
        Header: t('出库成本'),
        accessor: 'no_tax_amount_edit',
        diyEnable: false,
        isKeyboard: true,
        minWidth: 140,
        Cell: (cellProps) => {
          return (
            <TextAreaCell
              field='no_tax_amount_edit'
              data={cellProps.original}
            />
          )
        },
      },
      {
        Header: t('税额'),
        accessor: 'tax_money',
        diyEnable: false,
        isKeyboard: true,
        minWidth: 140,
        Cell: (cellProps) => {
          return (
            <TextAreaCell
              field='tax_money_edit'
              index={cellProps.index}
              data={cellProps.original}
            />
          )
        },
      },
      {
        Header: t('税率'),
        accessor: 'money',
        diyEnable: false,
        isKeyboard: true,
        minWidth: 140,
        Cell: (cellProps) => {
          return (
            <TaxRateCell index={cellProps.index} data={cellProps.original} />
          )
        },
      },
      {
        Header: t('商品备注'),
        accessor: 'remark',
        minWidth: 200,
        isKeyboard: true,
        Cell: (cellProps) => {
          return (
            <RemarkCell index={cellProps.index} data={cellProps.original} />
          )
        },
      },
      {
        Header: t('操作人'),
        accessor: 'operator',
        minWidth: 90,
        Cell: (cellProps) => {
          return (
            <TextAreaCell data={cellProps.original} field='operator_name' />
          )
        },
      },
    ]
  }, [handleDetailAdd, productDetails, warehouse_id])
  return (
    <BoxPanel title={t('商品明细')} collapse right={<TableRight />}>
      <Table
        isDiy
        isEdit
        isKeyboard
        isVirtualized
        onAddRow={handleDetailAdd}
        id='purchase_stock_out_table'
        data={productDetails.slice()}
        isTrDisable={(item: any) => {
          return item.spu_status === 0
        }}
        columns={columns}
      />
    </BoxPanel>
  )
})

export default EditDetail
