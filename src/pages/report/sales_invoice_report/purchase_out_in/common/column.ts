import { t } from 'gm-i18n'
import _ from 'lodash'
import { Column } from '@gm-pc/table-x'
import { Price } from '@gm-pc/react'
import {
  getUnNillText,
  toFixedSalesInvoicing,
  toFixedByType,
} from '@/common/util'
import { CommonListType } from '../store'

const showCellQuantity = (n: number, unitName: string) => {
  if (!n) return getUnNillText(n)
  return toFixedSalesInvoicing(n) + unitName
}

const showCellPrice = (n: number) => {
  if (!n) return getUnNillText(n)
  return toFixedByType(n, 'dpInventoryAmount') + Price.getUnit()
}

export const CommonColumn: Column<CommonListType>[] = [
  {
    Header: t('商品名称'),
    minWidth: 120,
    Cell: (cellProps) => {
      const { sku_name } = cellProps.original
      return getUnNillText(sku_name)
    },
  },
  {
    Header: t('基本单位'),
    minWidth: 80,
    Cell: (cellProps) => {
      const { sku_base_unit_name } = cellProps.original
      return getUnNillText(sku_base_unit_name)
    },
  },
  {
    Header: t('分类'),
    accessor: 'category_name',
    minWidth: 140,
    Cell: (cellProps) => {
      const { category_name } = cellProps.original
      return getUnNillText(category_name)
    },
  },
  {
    Header: t('仓库名称'),
    accessor: 'warehouse_name',
    minWidth: 140,
    Cell: (cellProps) => {
      const { warehouse_name } = cellProps.original
      return getUnNillText(warehouse_name)
    },
  },
  {
    Header: t('采购入库数量'),
    accessor: 'purchase_in_stock_quantity',
    minWidth: 100,
    Cell: (cellProps) => {
      const { stock_value, sku_base_unit_name } = cellProps.original
      return showCellQuantity(
        _.toNumber(stock_value?.purchase_in_stock?.quantity),
        sku_base_unit_name,
      )
    },
  },
  {
    Header: t('采购入库均价'),
    accessor: 'purchase_in_stock_avg_price',
    minWidth: 100,
    Cell: (cellProps) => {
      const { stock_value } = cellProps.original
      return showCellPrice(_.toNumber(stock_value?.purchase_in_stock?.price))
    },
  },
  {
    Header: t('采购入库金额'),
    accessor: 'purchase_in_stock_amount',
    minWidth: 100,
    Cell: (cellProps) => {
      const { stock_value } = cellProps.original
      return showCellPrice(_.toNumber(stock_value?.purchase_in_stock?.amount))
    },
  },
  {
    Header: t('采购退货出库数量'),
    accessor: 'purchase_out_stock_quantity',
    minWidth: 120,
    Cell: (cellProps) => {
      const { stock_value, sku_base_unit_name } = cellProps.original
      return showCellQuantity(
        _.toNumber(stock_value?.refund_out_stock?.quantity),
        sku_base_unit_name,
      )
    },
  },
  {
    Header: t('采购退货出库均价'),
    accessor: 'purchase_out_stock_avg_price',
    minWidth: 120,
    Cell: (cellProps) => {
      const { stock_value } = cellProps.original
      return showCellPrice(_.toNumber(stock_value?.refund_out_stock?.price))
    },
  },
  {
    Header: t('采购退货出库金额'),
    accessor: 'purchase_out_stock_amount',
    minWidth: 120,
    Cell: (cellProps) => {
      const { stock_value } = cellProps.original
      return showCellPrice(_.toNumber(stock_value?.refund_out_stock?.amount))
    },
  },
  {
    Header: t('数量小计'),
    accessor: 'total_quantity',
    minWidth: 100,
    Cell: (cellProps) => {
      const { stock_value, sku_base_unit_name } = cellProps.original
      return showCellQuantity(
        _.toNumber(stock_value?.summary?.quantity),
        sku_base_unit_name,
      )
    },
  },
  {
    Header: t('金额小计'),
    accessor: 'total_amount',
    minWidth: 100,
    Cell: (cellProps) => {
      const { stock_value } = cellProps.original
      return showCellPrice(_.toNumber(stock_value?.summary?.amount))
    },
  },
]

export const purchaseColumns: Column<any>[] = [
  {
    Header: t('采购员'),
    minWidth: 80,
    Cell: (cellProps) => {
      const { purchase_name } = cellProps.original
      return getUnNillText(purchase_name)
    },
  },
  {
    Header: t('商品名称'),
    minWidth: 160,
    Cell: (cellProps) => {
      const { sku_name } = cellProps.original
      return getUnNillText(sku_name)
    },
  },
  {
    Header: t('仓库名称'),
    accessor: 'name',
    minWidth: 140,
    Cell: (cellProps) => {
      const { warehouse_name } = cellProps.original
      return getUnNillText(warehouse_name)
    },
  },
  {
    Header: t('供应商名称'),
    minWidth: 100,
    Cell: (cellProps) => {
      const { supplier_name } = cellProps.original
      return getUnNillText(supplier_name)
    },
  },
  {
    Header: t('基本单位'),
    minWidth: 100,
    Cell: (cellProps) => {
      const { sku_base_unit_name } = cellProps.original
      return getUnNillText(sku_base_unit_name)
    },
  },
  {
    Header: t('分类'),
    accessor: 'category_name',
    minWidth: 150,
    Cell: (cellProps) => {
      const { category_name } = cellProps.original
      return getUnNillText(category_name)
    },
  },
  {
    Header: t('入库数量'),
    accessor: 'purchase_in_stock_quantity',
    minWidth: 100,
    Cell: (cellProps) => {
      const { stock_value, sku_base_unit_name } = cellProps.original
      return showCellQuantity(
        _.toNumber(stock_value?.purchase_in_stock?.quantity),
        sku_base_unit_name,
      )
    },
  },
  {
    Header: t('入库均价'),
    accessor: 'purchase_in_stock_avg_price',
    minWidth: 100,
    Cell: (cellProps) => {
      const { stock_value } = cellProps.original
      return showCellPrice(_.toNumber(stock_value?.purchase_in_stock?.price))
    },
  },
  {
    Header: t('入库金额'),
    accessor: 'purchase_in_stock_amount',
    minWidth: 100,
    Cell: (cellProps) => {
      const { stock_value } = cellProps.original
      return showCellPrice(_.toNumber(stock_value?.purchase_in_stock?.amount))
    },
  },
]
