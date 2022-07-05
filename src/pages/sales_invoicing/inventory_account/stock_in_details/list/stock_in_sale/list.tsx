import React from 'react'
import { t } from 'gm-i18n'
import { observer } from 'mobx-react'
import { Price } from '@gm-pc/react'
import { Table, Column } from '@gm-pc/table-x'

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
    accessor: 'commName',
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
    Header: t('客户标签'),
    accessor: '',
    Cell: (cellProps) => {
      const customerLabel = cellProps.original?.customerLabel
      return customerLabel?.name || '-'
    },
  },
  {
    Header: t('客户编号'),
    Cell: (cellProps) => {
      const customerInfo = cellProps.original?.customerInfo
      return customerInfo?.customized_code || '-'
    },
  },
  {
    Header: t('客户名称'),
    Cell: (cellProps) => {
      const customerInfo = cellProps.original?.customerInfo
      return customerInfo?.name || '-'
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
    Header: t('售后单号'),
    accessor: 'after_sale_order_serial_no',
    Cell: (cellProps) => {
      const { after_sale_order_serial_no, after_sale_order_id } =
        cellProps.original
      return (
        <a
          className='gm-text-primary gm-cursor'
          href={`#/order/after_sales/after_sales_list/detail?serial_no=${after_sale_order_id}&type=detail`}
        >
          {after_sale_order_serial_no}
        </a>
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
  // {
  //   Header: t('入库数（包装单位(废弃)）'),
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
