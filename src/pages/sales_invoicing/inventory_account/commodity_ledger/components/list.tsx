import React from 'react'
import { t } from 'gm-i18n'
import _ from 'lodash'
import Big from 'big.js'
import moment from 'moment'
import { observer } from 'mobx-react'
import { Column, Table } from '@gm-pc/table-x'

import LedgerStore from '../store'
import globalStore from '@/stores/global'
import ToSheet from '@/pages/sales_invoicing/components/toSheet'
import {
  getUnNillText,
  toFixedByType,
  toFixedSalesInvoicing,
} from '@/common/util'
import { OPERATE_TYPE_NAME } from '@/pages/sales_invoicing/enum'
import { changeLogNum, showUnitText } from '@/pages/sales_invoicing/util'

const columns: Column[] = [
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
  // {
  //   Header: t('规格'),
  //   Cell: (cellProps) => {
  //     const { ssu_base_unit_name, ssu_info } = cellProps.original
  //     return showUnitText(ssu_info, ssu_base_unit_name)
  //   },
  // },
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
    Header: t('仓库'),
    show: globalStore.isOpenMultWarehouse,
    accessor: 'warehouse_name',
    Cell: (cellProps: any) => {
      const { warehouse_name } = cellProps.original
      return getUnNillText(warehouse_name)
    },
  },
  {
    Header: t('单据号'),
    // accessor: 'stock_sheet_serial_no',
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
    Header: t('变动类型'),
    Cell: (cellProps) => {
      const { operate_type } = cellProps.original
      return OPERATE_TYPE_NAME[operate_type] || '-'
    },
  },
  {
    Header: t('基本单位'),
    Cell: (cellProps) => {
      const { base_unit_name } = cellProps.original
      return base_unit_name ?? '-'
    },
  },
  {
    Header: t('变动前库存'),
    Cell: (cellProps) => {
      const {
        old_stock: { base_unit },
      } = cellProps.original
      return toFixedSalesInvoicing(Big(base_unit.quantity))
    },
  },
  {
    Header: t('变动库存'),
    Cell: (cellProps) => {
      const { old_stock, new_stock } = cellProps.original
      return changeLogNum({
        new_stock: new_stock.base_unit,
        old_stock: old_stock.base_unit,
        type: 'changeQuantity',
      })
    },
  },
  {
    Header: t('变动后库存'),
    Cell: (cellProps) => {
      const {
        new_stock: { base_unit },
      } = cellProps.original
      return toFixedSalesInvoicing(Big(base_unit.quantity))
    },
  },
  {
    Header: t('变动前货值'),
    Cell: (cellProps) => {
      const {
        old_stock: { base_unit },
      } = cellProps.original
      return changeLogNum({
        unit: base_unit,
        type: 'goodsValue',
      })
    },
  },
  {
    Header: t('变动货值'),
    Cell: (cellProps) => {
      const { old_stock, new_stock } = cellProps.original
      return changeLogNum({
        new_stock: new_stock.base_unit,
        old_stock: old_stock.base_unit,
        type: 'stockMoney',
      })
    },
  },
  {
    Header: t('变动后货值'),
    Cell: (cellProps) => {
      const {
        new_stock: { base_unit },
      } = cellProps.original
      return changeLogNum({
        unit: base_unit,
        type: 'goodsValue',
      })
    },
  },
  {
    Header: t('变动前均价'),
    Cell: (cellProps) => {
      const {
        old_stock: { base_unit },
      } = cellProps.original
      return toFixedByType(Big(base_unit.price), 'dpInventoryAmount')
    },
  },
  {
    Header: t('变动后均价'),
    Cell: (cellProps) => {
      const {
        new_stock: { base_unit },
      } = cellProps.original
      return toFixedByType(Big(base_unit.price), 'dpInventoryAmount')
    },
  },
  {
    Header: t('出/入库时间'),
    Cell: (cellProps) => {
      const { submit_time } = cellProps.original
      return moment(parseInt(submit_time)).format('YYYY-MM-DD HH:mm:ss')
    },
  },
  {
    Header: t('操作时间'),
    Cell: (cellProps) => {
      const { create_time } = cellProps.original
      return moment(parseInt(create_time)).format('YYYY-MM-DD HH:mm:ss')
    },
  },
  {
    Header: t('操作人'),
    Cell: (cellProps) => {
      const {
        groupUserInfo: { name },
      } = cellProps.original
      return name
    },
  },
]

const List = observer(() => {
  return (
    <>
      <Table data={LedgerStore.list.slice()} columns={columns} />
    </>
  )
})

export default List
