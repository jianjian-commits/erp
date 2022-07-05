import React from 'react'
import { t } from 'gm-i18n'
import _ from 'lodash'
import { observer } from 'mobx-react'
import { Table, Column } from '@gm-pc/table-x'

import ToSheet from '@/pages/sales_invoicing/components/toSheet'
import { showUnitText } from '@/pages/sales_invoicing/util'
import store from './store'
import Big from 'big.js'
import { getFormatTimeForTable, getUnNillText } from '@/common/util'
import { getShelfName } from '../../../util'
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
    Header: t('移库单号'),
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
    Header: t('移出货位'),
    Cell: (cellProps) => {
      const {
        attr: { trans_out_shelf },
        shelfs,
      } = cellProps.original
      return getShelfName(shelfs, trans_out_shelf)
    },
  },
  {
    Header: t('移入货位'),
    Cell: (cellProps) => {
      const {
        attr: { trans_in_shelf },
        shelfs,
      } = cellProps.original
      return getShelfName(shelfs, trans_in_shelf)
    },
  },
  {
    Header: t('移库数（基本单位）'),
    accessor: 'base_unit_quantity',
    Cell: (cellProps) => {
      const { base_unit_name, update_stock } = cellProps.original
      return Big(update_stock.base_unit.quantity).toFixed(4) + base_unit_name
    },
  },
  // {
  //   Header: t('移库数（包装单位(废弃)）'),
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
    Header: t('移库批次'),
    accessor: 'sku_unit_quantity',
    Cell: (cellProps) => {
      const {
        attr: { batch_serial_no },
      } = cellProps.original
      return batch_serial_no
    },
  },
  {
    Header: t('供应商'),
    accessor: 'supperInfo_name',
    Cell: (cellProps) => {
      const { supperInfo } = cellProps.original
      return supperInfo?.name || '-'
    },
  },
  {
    Header: t('入库日期'),
    accessor: 'submit_time',
    Cell: (cellProps) => {
      const { submit_time } = cellProps.original
      return getFormatTimeForTable('YYYY-MM-DD', submit_time)
    },
  },
  {
    Header: t('生产日期'),
    accessor: 'production_time',
    Cell: (cellProps) => {
      const { production_time } = cellProps.original
      return getFormatTimeForTable('YYYY-MM-DD', production_time)
    },
  },
  {
    Header: t('保质期'),
    accessor: 'expiry_time',
    Cell: (cellProps) => {
      const {
        attr: { expiry_time },
      } = cellProps.original
      return getFormatTimeForTable('YYYY-MM-DD', expiry_time)
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
