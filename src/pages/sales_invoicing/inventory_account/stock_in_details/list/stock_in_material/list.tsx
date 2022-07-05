import React from 'react'
import { t } from 'gm-i18n'
import _ from 'lodash'
import { observer } from 'mobx-react'
import { Price } from '@gm-pc/react'
import { Column, Table } from '@gm-pc/table-x'

import ToSheet from '@/pages/sales_invoicing/components/toSheet'
import { showUnitText, formatSecond } from '@/pages/sales_invoicing/util'
import store from './store'
import Big from 'big.js'
import { getUnNillText } from '@/common/util'
import { COMMON_COLUMNS } from '@/common/enum'
import globalStore from '@/stores/global'

const columns: Column[] = [
  {
    Header: t('自定义编码'),
    accessor: 'customize_code',
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
    Header: t('商品名称'),
    accessor: 'sku_name',
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
    Header: t('领料单号'),
    accessor: 'material_order_serial_no',
  },
  COMMON_COLUMNS.SKU_BASE_UNIT_NAME_NO_MINWIDTH,
  {
    Header: t('商品分类'),
    accessor: 'operate_name',
    Cell: (cellProps) => {
      const {
        skuInfo: { category_infos },
      } = cellProps.original
      return _.map(category_infos, (obj) => obj.category_name).join('/')
    },
  },
  {
    Header: t('仓库'),
    accessor: 'warehouse_name',
    show: globalStore.isOpenMultWarehouse,
    Cell: (cellProps: any) => {
      const { warehouse_name } = cellProps.original
      return getUnNillText(warehouse_name)
    },
  },
  {
    Header: t('退货入库单号'),
    Cell: (cellProps) => {
      const { stock_sheet_serial_no, sheet_type, stock_sheet_id } =
        cellProps.row.original
      return (
        <ToSheet
          source_type={sheet_type}
          serial_no={stock_sheet_serial_no}
          sheet_id={stock_sheet_id}
        />
      )
    },
  },
  {
    Header: t('入库数（基本单位）'),
    accessor: 'base_unit_quantity',
    Cell: (cellProps) => {
      const { base_unit_name, update_stock } = cellProps.original
      return Big(update_stock.base_unit.quantity).toFixed(4) + base_unit_name
    },
  },
  {
    Header: t('入库金额'),
    accessor: 'price',
    Cell: (cellProps) => {
      const { update_stock } = cellProps.original
      const { price, quantity } = update_stock.base_unit
      return Big(price).times(quantity).toFixed(4) + Price.getUnit()
    },
  },
  {
    Header: t('入库时间'),
    accessor: 'submit_time',
    Cell: (cellProps) => {
      const { submit_time } = cellProps.original
      return formatSecond(submit_time)
    },
  },
  {
    Header: t('商品备注'),
    accessor: 'remark',
  },
]

const List = observer(() => {
  const { list } = store

  return <Table isDiy data={list.slice()} columns={columns} />
})

export default List
