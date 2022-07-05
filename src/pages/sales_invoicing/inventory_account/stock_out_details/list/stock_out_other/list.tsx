import React from 'react'
import { t } from 'gm-i18n'
import _ from 'lodash'
import { observer } from 'mobx-react'
import { Price } from '@gm-pc/react'
import { Table, Column } from '@gm-pc/table-x'

import ToSheet from '@/pages/sales_invoicing/components/toSheet'
import { showUnitText, formatSecond } from '@/pages/sales_invoicing/util'
import store from './store'
import { getEndlessPrice, getUnNillText } from '@/common/util'
import Big from 'big.js'
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
  COMMON_COLUMNS.SKU_BASE_UNIT_NAME_NO_MINWIDTH,
  // {
  //   Header: t('规格'),
  //   accessor: 'unit',
  //   Cell: (cellProps) => {
  //     const { ssu_base_unit_name, ssu_info } = cellProps.original
  //     return showUnitText(ssu_info, ssu_base_unit_name)
  //   },
  // },
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
      const { warehouse_name } = cellProps.row.original
      return getUnNillText(warehouse_name)
    },
  },
  {
    Header: t('其他出库单号'),
    Cell: (cellProps) => {
      const { stock_sheet_serial_no, sheet_type, stock_sheet_id } =
        cellProps.original
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
    Header: t('出库数（基本单位）'),
    accessor: 'base_unit_quantity',
    Cell: (cellProps) => {
      const { base_unit_name, update_stock } = cellProps.original
      return Big(update_stock.base_unit.quantity).toFixed(4) + base_unit_name
    },
  },
  // {
  //   Header: t('出库数（包装单位(废弃)）'),
  //   accessor: 'sku_unit_quantity',
  //   Cell: (cellProps) => {
  //     const { ssu_info, update_stock } = cellProps.original
  //     return ssu_info
  //       ? Big(update_stock.sku_unit.quantity).toFixed(4) +
  //           ssu_info?.ssu?.unit?.name
  //       : '-'
  //   },
  // },
  {
    Header: t('出库成本价'),
    accessor: 'stock_out_cost',
    Cell: (cellProps) => {
      const { update_stock, base_unit_name } = cellProps.original
      const price = getEndlessPrice(Big(update_stock.base_unit.price))
      return price + `${Price.getUnit()}/${base_unit_name}`
    },
  },
  {
    Header: t('出库成本'),
    accessor: 'price',
    Cell: (cellProps) => {
      const { update_stock } = cellProps.original
      const { price, quantity } = update_stock.base_unit
      return Big(price).times(quantity).toFixed(4) + Price.getUnit()
    },
  },
  {
    Header: t('出库时间'),
    accessor: 'submit_time',
    Cell: (cellProps) => {
      const { submit_time } = cellProps.original
      return formatSecond(submit_time)
    },
  },
]

const List = observer(() => {
  const { list } = store

  return <Table isDiy data={list.slice()} columns={columns} />
})

export default List
