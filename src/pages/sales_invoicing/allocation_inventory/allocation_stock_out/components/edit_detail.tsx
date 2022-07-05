import React, { useCallback } from 'react'
import { BoxPanel, Price } from '@gm-pc/react'
import { TableXUtil, Table } from '@gm-pc/table-x'
import { t } from 'gm-i18n'
import store from '../stores/receipt_store'
import { Observer, observer } from 'mobx-react'
import TableRight from '@/common/components/key_board_tips'
import { TextAreaCell } from '@/pages/sales_invoicing/components'
import { BatchDetailCell, RemarkCell } from './product_detail'
import { COMMON_COLUMNS } from '@/common/enum'
import {
  quoteCommonColumn,
  sortHeader,
  BaseQuantityColumn,
} from '@/pages/sales_invoicing/common_column_enum'
import { toFixedByType } from '@/common/util'

const { TABLE_X } = TableXUtil

const EditDetail = observer(() => {
  const { productDetails, receiptDetail, changeProductDetailsItem } = store

  const handleDetailAdd = useCallback(() => {
    store.addProductDetailsItem()
  }, [])

  const limit = 12
  const tableHeight =
    TABLE_X.HEIGHT_HEAD_TR +
    Math.min(limit, productDetails.length) * TABLE_X.HEIGHT_TR

  // 做一层记忆处理，若内部有值会变，需要放到第二个参数中
  const columns = React.useMemo(() => {
    return [
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
        minWidth: 150,
        isKeyboard: true,
        Cell: (cellProps: any) => {
          const { sku_name } = cellProps.original
          return sku_name ?? '-'
        },
      },
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
        minWidth: 130,
        accessor: 'category',
        Cell: (cellProps: any) => {
          return <TextAreaCell data={cellProps.row.original} field='category' />
        },
      },
      {
        Header: t('当前库存（基本单位）'),
        minWidth: 100,
        accessor: 'currStockQuantity',
        Cell: (cellProps: any) => {
          return (
            <TextAreaCell
              field='currStockQuantity'
              data={cellProps.row.original}
            />
          )
        },
      },
      quoteCommonColumn('CURRENT_STOCK', { type: 'add' }),
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
        Cell: (cellProps: any) => {
          return (
            <BatchDetailCell
              index={cellProps.row.index}
              data={cellProps.row.original}
              warehouseId={receiptDetail.warehouse_id as string}
            />
          )
        },
      },
      {
        Header: t('出库单价'),
        minWidth: 150,
        accessor: 'tax_input_price',
        isKeyboard: true,
        diyEnable: false,
        Cell: (cellProps: any) => {
          return (
            <Observer>
              {() => {
                const { tax_input_price } = cellProps.original
                return (
                  <span>
                    {toFixedByType(tax_input_price, 'dpInventoryAmount') +
                      Price.getUnit()}
                  </span>
                )
              }}
            </Observer>
          )
        },
      },
      {
        Header: t('出库成本'),
        minWidth: 150,
        accessor: 'ssu_base_price',
        isKeyboard: true,
        diyEnable: false,
        Cell: (cellProps: any) => {
          return (
            <TextAreaCell
              field='amount_compatible'
              data={cellProps.row.original}
            />
          )
        },
      },
      {
        Header: t('商品备注'),
        accessor: 'remark',
        minWidth: 170,
        isKeyboard: true,
        Cell: (cellProps: any) => {
          return (
            <RemarkCell index={cellProps.index} data={cellProps.original} />
          )
        },
      },
      {
        Header: t('操作人'),
        accessor: 'operator',
        minWidth: 100,
        Cell: (cellProps: any) => {
          const { operator_name } = cellProps.original
          return operator_name ?? '-'
        },
      },
    ].filter((item) => item) // 由于diy,show 不可控，因此需要特殊处理，这里去除false
  }, []) // 由于这里做了记忆，任何可能改变的值都应该加到这里来，以免改变时未触发更新导致意想不到的bug

  return (
    <BoxPanel title={t('商品明细')} collapse right={<TableRight />}>
      <Table
        isDiy
        isEdit
        // isBatchSelect
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
