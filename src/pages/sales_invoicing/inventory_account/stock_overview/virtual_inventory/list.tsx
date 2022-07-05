import React from 'react'
import { t } from 'gm-i18n'
import _ from 'lodash'
import Big from 'big.js'
import { observer } from 'mobx-react'
import {
  TableX,
  subTableXHOC,
  expandTableXHOC,
  selectTableXHOC,
  getTableXChild,
  Column,
} from '@gm-pc/table-x'
import { BoxTable, BoxTableProps } from '@gm-pc/react'
import { getUnNillText, toFixed, toFixedSalesInvoicing } from '@/common/util'

import ToSheet from '@/pages/sales_invoicing/components/toSheet'
import { formatSecond, showUnitText } from '@/pages/sales_invoicing/util'
import store from './store'

import BatchAction from './batch_action'
import { quoteCommonColumn } from '@/pages/sales_invoicing/common_column_enum'
import globalStore from '@/stores/global'

const Table = selectTableXHOC(expandTableXHOC(TableX))
const SubTable = selectTableXHOC(subTableXHOC(TableX))
const TableChild = getTableXChild(Table, SubTable)

const batchColumns: Column[] = [
  {
    Header: t('临时批次号'),
    accessor: 'batch_serial_no',
  },
  {
    Header: t('关联单据号'),
    Cell: (cellProps) => {
      const { source_sheet_type, in_stock_sheet_id, stock_sheet_serial_no } =
        cellProps.original
      return (
        <ToSheet
          source_type={source_sheet_type}
          serial_no={stock_sheet_serial_no}
          sheet_id={in_stock_sheet_id}
        />
      )
    },
  },
  {
    Header: t('已出库数'),
    Cell: (cellProps) => {
      const {
        origin_stock: { base_unit },
        base_unit_name,
      } = cellProps.original
      return (
        toFixedSalesInvoicing(Big(base_unit.quantity)) + `${base_unit_name}`
      )
    },
  },
  {
    Header: t('出库时间'),
    Cell: (cellProps) => {
      const { in_stock_time } = cellProps.original
      return formatSecond(in_stock_time)
    },
  },
]

const skuColumns: Column[] = [
  {
    Header: t('自定义编码'),
    Cell: (cellProps) => {
      const {
        skuInfo: {
          sku: { customize_code },
        },
      } = cellProps.original
      return customize_code
    },
  },
  {
    Header: t('仓库'),
    show: globalStore.isOpenMultWarehouse,
    Cell: (cellProps: { row: { original: any } }) => {
      const { warehouse_name } = cellProps.row.original
      return getUnNillText(warehouse_name)
    },
  },
  {
    Header: t('商品名称'),
    Cell: (cellProps) => {
      const {
        skuInfo: {
          sku: { name },
        },
      } = cellProps.original
      return name
    },
  },
  {
    Header: t('商品分类'),
    Cell: (cellProps) => {
      const {
        skuInfo: { category_infos },
      } = cellProps.original
      return _.map(category_infos, (obj) => obj.category_name).join('/')
    },
  },
  {
    Header: t('超支库存(基本单位)'),
    Cell: (cellProps) => {
      const {
        virtual_stock: { base_unit },
        base_unit_name,
      } = cellProps.original
      return (
        toFixedSalesInvoicing(Big(base_unit.quantity)) + `${base_unit_name}`
      )
    },
  },
  {
    Header: t('超支库存(辅助单位)'),
    Cell: (cellProps) => {
      const { second_base_unit_name, second_base_unit_virtual_quantity } =
        cellProps.original

      return second_base_unit_virtual_quantity &&
        second_base_unit_virtual_quantity !== '-'
        ? toFixed(second_base_unit_virtual_quantity || 1, 4) +
            second_base_unit_name
        : '-'
    },
  },
  quoteCommonColumn(
    'MUTI_UNIT_DISPLAY',
    { type: 'virtual' },
    {
      Header: t('多单位数量汇总'),
    },
  ),
]

const List = observer(({ pagination }: Pick<BoxTableProps, 'pagination'>) => {
  const {
    list,
    choseList: { select_all, select_batch },
  } = store

  return (
    <BoxTable pagination={pagination}>
      <TableChild
        data={list.slice()}
        selected={select_all.slice()}
        onSelect={(select, selectTree) => {
          store.handleChangeListTree(select, selectTree)
        }}
        columns={skuColumns}
        keyField='sku_id'
        subProps={{
          keyField: 'batch_id',
          columns: batchColumns,
        }}
        batchActionBar={select_batch.length >= 1 && <BatchAction />}
      />
    </BoxTable>
  )
})

export default List
