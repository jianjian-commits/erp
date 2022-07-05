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
import globalStore from '@/stores/global'
import { COMMON_COLUMNS } from '@/common/enum'
import { getUnNillText } from '@/common/util'

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
    Header: t('供应商编号'),
    accessor: 'customized_code',
    Cell: (cellProps) => {
      const { supperInfo } = cellProps.original
      return supperInfo?.customized_code || '-'
    },
  },
  {
    Header: t('供应商名称'),
    accessor: 'supperInfo_name',
    Cell: (cellProps) => {
      const { supperInfo } = cellProps.original
      return supperInfo?.name ?? '-'
    },
  },
  {
    Header: t('采购员'),
    accessor: 'purchase_name',
    hide: globalStore.isLite,
    Cell: (cellProps) => {
      const { purchaserInfo } = cellProps.original
      return purchaserInfo?.name ?? '-'
    },
  },
  // {
  //   Header: t('规格'),
  //   accessor: 'unit',
  //   Cell: (cellProps) => {
  //     const { ssu_base_unit_name, ssu_info } = cellProps.original
  //     return showUnitText(ssu_info, ssu_base_unit_name)
  //   },
  // },
  COMMON_COLUMNS.SKU_BASE_UNIT_NAME_NO_MINWIDTH,
  {
    Header: t('商品分类'),
    accessor: 'operate_name',
    Cell: (cellProps) => {
      const {
        skuInfo: { category_infos },
      } = cellProps.original
      return _.map(category_infos, (obj) => obj.category_name)
        .filter(Boolean)
        .join('/')
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
    Header: t('采购入库单号'),
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
    Header: t(globalStore.isLite ? '入库数' : '入库数（基本单位）'),
    accessor: 'base_unit_quantity',
    Cell: (cellProps) => {
      const { base_unit_name, update_stock } = cellProps.original
      return Big(update_stock.base_unit.quantity).toFixed(4) + base_unit_name
    },
  },
  // {
  //   Header: t('入库数（包装单位(废弃)）'),
  //   accessor: 'sku_unit_quantity',
  //   hide: globalStore.isLite,
  //   Cell: (cellProps) => {
  //     const { ssu_info, update_stock } = cellProps.original
  //     return ssu_info
  //       ? Big(update_stock.sku_unit.quantity).toFixed(4) +
  //           ssu_info?.ssu?.unit?.name
  //       : '-'
  //   },
  // },
  {
    Header: t('入库金额'),
    accessor: 'price',
    Cell: (cellProps) => {
      const { tax_amount } = cellProps.original
      if (!tax_amount) return <span>-</span>
      return tax_amount + Price.getUnit()
    },
  },
  {
    Header: t('不含税金额'),
    accessor: 'price',
    hide: globalStore.isLite,
    Cell: (cellProps) => {
      const { update_stock } = cellProps.original
      const { price, quantity } = update_stock.base_unit
      return Big(price).times(quantity).toFixed(4) + Price.getUnit()
    },
  },
  {
    Header: t('税额'),
    accessor: 'price',
    hide: globalStore.isLite,
    Cell: (cellProps) => {
      const { tax_amount, update_stock, amount } = cellProps.original
      if (!tax_amount && !amount) return <span>-</span>
      const { price, quantity } = update_stock.base_unit
      return (
        Big(tax_amount || 0)
          .minus(Big(price).times(quantity))
          .abs()
          .toFixed(2) + Price.getUnit()
      )
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
