import React, { useCallback } from 'react'
import { Observer, observer } from 'mobx-react'
import { t } from 'gm-i18n'
import { BoxPanel, Price } from '@gm-pc/react'
import { TableXUtil, Table, Column } from '@gm-pc/table-x'

import TableRight from '@/common/components/key_board_tips'
import { COMMON_COLUMNS } from '@/common/enum'

import {
  ProductNameCell,
  OperationCell,
  BatchDetailCell,
} from './product_detail'

import { TextAreaCell } from '@/pages/sales_invoicing/components'
import RemarkCell from '@/pages/sales_invoicing/sales/stock_out/components/product_detail/remake_cell'
import {
  quoteCommonColumn,
  sortHeader,
  BaseQuantityColumn,
} from '@/pages/sales_invoicing/common_column_enum'

import { DetailStore } from '../stores'
import globalStore from '@/stores/global'
import { toJS } from 'mobx'
import { GroupUser } from 'gm_api/src/enterprise'
import { toFixedByType } from '@/common/util'

const { OperationHeader, TABLE_X } = TableXUtil

const EditDetail = observer(() => {
  const {
    productDetails,
    receiptDetail,
    changeProductDetailsItem,
    getAdditionInfo,
  } = DetailStore
  const { order_id, warehouse_id } = receiptDetail

  console.log(toJS(productDetails), '销售出库') // 暂时保留, 打印才能渲染 出库单价/出库成本

  const handleDetailAdd = useCallback(() => {
    DetailStore.addProductDetailsItem()
  }, [])

  // 做一层记忆处理，若内部有值会变，需要放到第二个参数中
  const columns: Column[] = React.useMemo(() => {
    return [
      COMMON_COLUMNS.INDEX,
      {
        Header: OperationHeader,
        accessor: 'action',
        hide: order_id !== '0',
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
          DetailStore,
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
      COMMON_COLUMNS.SKU_BASE_UNIT_NAME,
      {
        Header: sortHeader(
          {
            title: t('商品分类'),
            field: 'category_name',
          },
          DetailStore,
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
        Header: t(globalStore.isLite ? '出库单价' : '出库单价（基本单位）'),
        minWidth: 150,
        accessor: 'base_price',
        diyEnable: false,
        Cell: (cellProps) => {
          return (
            <Observer>
              {() => {
                const {
                  batch_selected,
                  input_stock: { input },
                } = cellProps.original
                const out_stock_base_price =
                  batch_selected.length > 0
                    ? toFixedByType(input?.price, 'dpInventoryAmount') +
                      Price.getUnit()
                    : '-'
                return <span>{out_stock_base_price}</span>
              }}
            </Observer>
          )
        },
      },

      {
        Header: t('出库成本'),
        accessor: 'amount',
        hide: globalStore.isLite,
        diyEnable: false,
        minWidth: 140,
        Cell: (cellProps) => {
          const { amount } = cellProps.original
          return <span>{amount ? amount + Price.getUnit() : '-'}</span>
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
          const { operator_id } = cellProps.original
          const operator = getAdditionInfo<GroupUser>(
            'group_users',
            operator_id,
          )
          return operator?.name || '-'
        },
      },
    ]
  }, [handleDetailAdd, order_id, warehouse_id])

  return (
    <BoxPanel title={t('商品明细')} collapse right={<TableRight />}>
      <Table
        isDiy
        isEdit
        isKeyboard
        onAddRow={handleDetailAdd}
        id='sales_stock_out_edit_table'
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
