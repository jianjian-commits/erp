import React from 'react'
import { t } from 'gm-i18n'
import { observer } from 'mobx-react'
import { BoxTable } from '@gm-pc/react'
import {
  TableX,
  fixedColumnsTableXHOC,
  diyTableXHOC,
  expandTableXHOC,
  subTableXHOC,
} from '@gm-pc/table-x'
import { toFixedSalesInvoicing, toFixedByType } from '@/common/util'
import { showUnitText } from '@/pages/sales_invoicing/util'
import { getSort } from '@/pages/iot/device_management/util'
import store from '../store'

const columns: any[] = [
  {
    Header: t('自定义编码'),
    id: 'customize_code',
    Cell: (cellProps: { row: { original: any } }) => {
      const {
        sku_info: {
          sku: { customize_code },
        },
      } = cellProps.row.original
      return customize_code
    },
  },
  {
    Header: t('商品名称'),
    id: 'name',
    Cell: (cellProps: { row: { original: any } }) => {
      const {
        sku_info: {
          sku: { name },
        },
      } = cellProps.row.original
      return name
    },
  },
  {
    Header: t('是否包材'),
    id: 'package_sub_sku_type',
    Cell: (cellProps: { row: { original: any } }) => {
      const {
        sku_info: { sku },
      } = cellProps.row.original
      return sku?.package_sub_sku_type !== 0 ? '包材商品' : '非包材商品'
    },
  },
  {
    Header: t('商品分类'),
    id: 'category_infos',
    headerSort: true,
    Cell: (cellProps: { row: { original: any } }) => {
      const {
        sku_info: { category_infos },
      } = cellProps.row.original
      return category_infos?.map((it) => it.category_name).join('/')
    },
  },
  {
    Header: t('账面货值'),
    accessor: 'end_stock_value',
    Cell: (cellProps: { row: { original: any } }) => {
      const {
        stock_value: {
          end_stock: { amount: value },
        },
      } = cellProps.row.original
      return toFixedByType(value, 'dpInventoryAmount')
    },
  },
  {
    Header: t('参考成本价'),
    accessor: 'end_stock_avg_price',
    Cell: (cellProps: { row: { original: any } }) => {
      const {
        stock_value: {
          end_stock: { price: value },
        },
      } = cellProps.row.original
      return toFixedByType(value, 'dpInventoryAmount')
    },
  },
]

const subColumns = [
  {
    Header: t('标准规格名称'),
    Cell: (cellProps: { row: { original: any } }) => {
      const { ssu_base_unit_name, ssu_info } = cellProps.row.original
      return showUnitText(ssu_info, ssu_base_unit_name)
    },
  },
  {
    Header: t('基本单位'),
    accessor: 'base_unit_name',
  },
  {
    Header: t('库存数量'),
    accessor: 'end_stock',
    Cell: (cellProps: { row: { original: any } }) => {
      const {
        stock_value: {
          end_stock: { quantity: value },
        },
      } = cellProps.row.original
      return toFixedSalesInvoicing(value)
    },
  },
  {
    Header: t('库存成本'),
    accessor: 'end_stock_value',
    Cell: (cellProps: { row: { original: any } }) => {
      const {
        stock_value: {
          end_stock: { amount: value },
        },
      } = cellProps.row.original
      return toFixedByType(value, 'dpInventoryAmount')
    },
  },
  {
    Header: t('本期成本价'),
    accessor: 'end_stock_avg_price',
    Cell: (cellProps: { row: { original: any } }) => {
      const {
        stock_value: {
          end_stock: { price: value },
        },
      } = cellProps.row.original
      return toFixedByType(value, 'dpInventoryAmount')
    },
  },
]

const ExpandTableX = expandTableXHOC(
  fixedColumnsTableXHOC(diyTableXHOC(TableX)),
)
const SubTable = subTableXHOC(TableX)

const List: React.FC<{ run: Function }> = observer((props) => {
  // 收缩 diy

  const { run } = props
  const { expanded, list } = store

  const handleExpand = (expanded: { [key: number]: boolean }) => {
    store.changeExpanded(expanded)
  }

  return (
    <>
      <BoxTable>
        <ExpandTableX
          onExpand={handleExpand}
          // 传列表为true的商户id
          expanded={expanded}
          data={list}
          keyField=''
          columns={columns}
          onHeadersSort={(des) => {
            store.updateFilter('sort', getSort(des))
            run()
          }}
          SubComponent={({ original }) => {
            return (
              <SubTable data={original.ssu_stock_list} columns={subColumns} />
            )
          }}
        />
      </BoxTable>
    </>
  )
})

export default List
