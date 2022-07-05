import { Column, Table } from '@gm-pc/table-x'
import { t } from 'gm-i18n'
import React, { FC, useMemo } from 'react'
import { Batch, Batch_BatchType } from 'gm_api/src/inventory'
import {
  getEndlessPrice,
  getFormatTimeForTable,
  toFixedSalesInvoicing,
} from '@/common/util'
import { Price } from '@gm-pc/react'

import { Route } from 'gm_api/src/delivery'
import { Customer } from 'gm_api/src/enterprise'
import _ from 'lodash'
import Big from 'big.js'
import globalStore from '@/stores/global'
import { COMMON_COLUMNS } from '@/common/enum'

interface SelectedTableProps {
  data: Batch[]
  hasSkuUnit?: boolean
  hasCustomer?: boolean
  type?: 'refund_stock_in' | 'inventory'
  someInfo?: {
    customerList: Customer[]
    routeList: Route[]
  }
}

const DetailTable: FC<SelectedTableProps> = (props) => {
  const { data, hasSkuUnit, type, hasCustomer, someInfo } = props
  const isInventory = type === 'inventory'
  const isRefundStockIn = type === 'refund_stock_in'

  let baseText = ''
  // let ssuText = ''
  if (isRefundStockIn) {
    baseText = t('入库数（基本单位）')
    // ssuText = t('入库数（包装单位(废弃)）')
  } else if (isInventory) {
    baseText = t(globalStore.isLite ? '实盘库存' : '实盘库存（基本单位）')
    // ssuText = t('实盘库存（包装单位(废弃)）')
  } else {
    baseText = t(globalStore.isLite ? '出库数' : '出库数（基本单位）')
    // ssuText = t('出库数（包装单位(废弃)）')
  }
  const _columns: Column[] = useMemo(
    () => [
      {
        Header: t('入库时间'),
        accessor: 'in_stock_time',
        minWidth: 140,
        Cell: (cellProps) => {
          return getFormatTimeForTable(
            'YYYY-MM-DD HH:mm',
            cellProps.original.in_stock_time,
          )
        },
      },
      COMMON_COLUMNS.SKU_BASE_UNIT_NAME,
      {
        Header: t('生产日期'),
        accessor: 'production_time',
        show: !isInventory,
        hide: globalStore.isLite,
        minWidth: 100,
        Cell: (cellProps) => {
          return getFormatTimeForTable(
            'YYYY-MM-DD',
            cellProps.original.production_time,
          )
        },
      },
      {
        Header: t('商品等级'),
        accessor: 'sku_level_filed_id',
        width: 100,
        Cell: (cellProps) => {
          const { sku_level_filed_id } = cellProps.original
          return <span>{sku_level_filed_id?.name ?? '-'}</span>
        },
      },
      {
        Header: t('供应商'),
        accessor: 'supplier_id',
        width: 80,
        Cell: (cellProps) => {
          return cellProps.original.supplier_name ?? '-'
        },
      },
      {
        Header: t('采购员'),
        accessor: 'purchaser_id',
        width: 100,
        Cell: (cellProps) => {
          return cellProps.original.purchaser_name ?? '-'
        },
      },
      {
        Header: t('批次号'),
        accessor: 'batch_serial_no',
        minWidth: 175,
        Cell: (cellProps) => {
          const { type, batch_serial_no } = cellProps.original
          return type === Batch_BatchType.BATCH_TYPE_TMP
            ? t('虚拟批次号')
            : batch_serial_no
        },
      },
      {
        Header: t('批次均价'),
        accessor: 'batch_average_price',
        minWidth: 120,
        show: !isInventory,
        Cell: (cellProps) => {
          return (
            getEndlessPrice(Big(cellProps.original.batch_average_price), true) +
            Price.getUnit()
          )
        },
      },
      {
        Header: t('货位'),
        accessor: 'shelf_name',
        hide: globalStore.isLite,
        minWidth: 120,
        Cell: (cellProps) => {
          return cellProps.original.shelf_name
            ? cellProps.original.shelf_name
            : '未分配'
        },
      },
      {
        Header: t(globalStore.isLite ? '账面库存' : '账面库存(基本单位)'),
        accessor: 'sku_stock_base_quantity',
        minWidth: 130,
        show: isInventory,
        Cell: (cellProps) => {
          const { sku_base_unit_name, sku_stock_base_quantity } =
            cellProps.original
          return (
            toFixedSalesInvoicing(sku_stock_base_quantity) + sku_base_unit_name
          )
        },
      },
      /** 商品改造弃掉包装单位 */
      // {
      //   Header: t('账面库存(包装单位(废弃))'),
      //   accessor: 'ssu_stock_quantity',
      //   minWidth: 130,
      //   hide: globalStore.isLite,
      //   show: isInventory,
      //   Cell: (cellProps) => {
      //     const { ssu_unit_name, ssu_stock_quantity } = cellProps.original
      //     return toFixedSalesInvoicing(ssu_stock_quantity) + ssu_unit_name
      //   },
      // },
      {
        Header: baseText,
        accessor: 'sku_base_quantity',
        minWidth: 130,
        Cell: (cellProps) => {
          const { sku_base_unit_name, sku_base_quantity } = cellProps.original
          return toFixedSalesInvoicing(sku_base_quantity) + sku_base_unit_name
        },
      },
      // {
      //   Header: ssuText,
      //   accessor: 'ssu_quantity',
      //   hide: globalStore.isLite,
      //   minWidth: 130,
      //   Cell: (cellProps) => {
      //     const { ssu_unit_name, ssu_quantity } = cellProps.original
      //     return toFixedSalesInvoicing(ssu_quantity) + ssu_unit_name
      //   },
      // },
      // {
      //   Header: t('关联客户'),
      //   accessor: 'target_customer_name',
      //   hide: !hasCustomer || globalStore.isLite,
      //   minWidth: 130,
      //   Cell: (cellProps) => {
      //     return +cellProps.original.target_customer_id!
      //       ? _.find(someInfo?.customerList, {
      //           customer_id: cellProps.original.target_customer_id,
      //         })?.name
      //       : '-'
      //   },
      // },
      // {
      //   Header: t('关联线路'),
      //   accessor: 'target_customer_name',
      //   hide: !hasCustomer || globalStore.isLite,
      //   minWidth: 130,
      //   Cell: (cellProps) => {
      //     return +cellProps.original.target_route_id!
      //       ? _.find(someInfo?.routeList, {
      //           route_id: cellProps.original.target_route_id,
      //         })?.route_name
      //       : '-'
      //   },
      // },
    ],
    [baseText, hasSkuUnit, isInventory, hasCustomer, someInfo],
  )

  return <Table data={data} columns={_columns} />
}

export default DetailTable
