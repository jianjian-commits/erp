import React from 'react'
import { t } from 'gm-i18n'
import { observer } from 'mobx-react'
import { BoxPanel } from '@gm-pc/react'
import { Table, Column } from '@gm-pc/table-x'
import TableRight from '@/common/components/key_board_tips'

import { TextAreaCell } from '@/pages/sales_invoicing/components'
import { COMMON_COLUMNS } from '@/common/enum'

import store from '../stores/detail_store'
import { toFixedSalesInvoicing } from '@/common/util'
import {
  quoteCommonColumn,
  sortHeader,
} from '@/pages/sales_invoicing/common_column_enum'

const Detail = observer(() => {
  const { productList } = store

  // 做一层记忆处理，若内部有值会变，需要放到第二个参数中
  const columns: Column[] = React.useMemo(() => {
    return [
      COMMON_COLUMNS.INDEX,
      {
        Header: sortHeader(
          {
            title: t('商品名称'),
            field: 'sku_name',
          },
          store,
        ),
        diyItemText: t('商品名称'),
        accessor: 'sku_name',
        diyEnable: false,
        minWidth: 150,
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
        minWidth: 100,
        accessor: 'category',
        Cell: (cellProps) => {
          return <TextAreaCell data={cellProps.original} field='categoryV2' />
        },
      },
      {
        Header: t('入库数（基本单位）'),
        diyEnable: false,
        accessor: 'ssu_base_quantity',
        minWidth: 150,
        Cell: (cellProps) => {
          const data = cellProps.original
          return (
            toFixedSalesInvoicing(data?.input_stock?.input?.quantity) +
            data?.sku_base_unit_name
          )
        },
      },
      /** 入库数(辅助单位) */
      quoteCommonColumn('SECOND_QUANTITY'),
      {
        Header: t('入库单价（基本单位）'),
        minWidth: 150,
        accessor: 'base_price',
        diyEnable: false,
        Cell: (cellProps) => {
          return <TextAreaCell data={cellProps.original} field='base_price' />
        },
      },
      {
        Header: t('入库金额'),
        accessor: 'amount',
        diyEnable: false,
        minWidth: 140,
        Cell: (cellProps) => {
          return (
            <TextAreaCell data={cellProps.original} field='amount_compatible' />
          )
        },
      },

      {
        Header: t('生产日期'),
        accessor: 'production_time',
        minWidth: 160,
        Cell: (cellProps) => {
          return (
            <TextAreaCell data={cellProps.original} field='production_time' />
          )
        },
      },
      {
        Header: t('存放货位'),
        accessor: 'shelf_name',
        minWidth: 200,
        Cell: (cellProps) => {
          return <TextAreaCell data={cellProps.original} field='shelf_name' />
        },
      },
      {
        Header: t('商品备注'),
        accessor: 'remark',
        minWidth: 200,
        Cell: (cellProps) => {
          return <TextAreaCell data={cellProps.original} field='remark' />
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
  }, []) // 由于这里做了记忆，任何可能改变的值都应该加到这里来，以免改变时未触发更新导致意想不到的bug

  return (
    <BoxPanel title={t('商品明细')} collapse right={<TableRight />}>
      <Table
        isDiy
        isKeyboard
        id='in_stock_detail_table'
        data={productList.slice()}
        isTrDisable={(item: any) => {
          return item.spu_status === 0
        }}
        columns={columns}
      />
    </BoxPanel>
  )
})

export default Detail
