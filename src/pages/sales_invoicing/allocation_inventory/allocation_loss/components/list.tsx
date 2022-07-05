import React, { useMemo } from 'react'
import { Table } from '@gm-pc/table-x'
import { t } from 'gm-i18n'
import store from '../stores/store'
import { observer } from 'mobx-react'
import _ from 'lodash'
import { formatDateTime } from '@/common/util'
import { getInputNumOrUnit } from '@/pages/sales_invoicing/allocation_inventory/util'
import { BoxTable, BoxTableProps } from '@gm-pc/react'
import { combineCategoryAndSku } from '@/pages/sales_invoicing/util'

interface ListProps extends Pick<BoxTableProps, 'pagination'> {
  onFetchList: () => any
  loading: boolean
}
const List = observer((props: ListProps) => {
  const { groupUsers, warehouses, additional, list } = store
  const { loading, pagination } = props

  const _columns = useMemo(() => {
    return _.without([
      {
        Header: t('序号'),
        id: 'index',
        fixed: 'left',
        width: 80,
        Cell: (cellProps: { row: { index: number } }) => {
          return <div>{cellProps.row.index + 1}</div>
        },
      },
      {
        Header: t('商品名称'),
        id: 'name',
        minWidth: 100,
        Cell: (cellProps: any) => {
          const { sku_id } = cellProps.row.original
          const sku_map = additional?.sku_map
          return <div>{sku_map?.[sku_id]?.name ?? '-'}</div>
        },
      },
      {
        Header: t('关联调拨单'),
        id: 'relation_id',
        minWidth: 130,
        Cell: (cellProps: any) => {
          const {
            warehouse_transfer_sheet_serial_no,
            warehouse_transfer_sheet_id,
          } = cellProps.row.original
          return (
            <a
              className='gm-text-primary gm-cursor'
              href={`#/sales_invoicing/allocation_inventory/allocation_order/detail?sheet_id=${warehouse_transfer_sheet_id}`}
            >
              {warehouse_transfer_sheet_serial_no}
            </a>
          )
        },
      },
      {
        Header: t('调出仓库'),
        id: 'out_warehouse_id',
        minWidth: 100,
        Cell: (cellProps: any) => {
          const { out_warehouse_id } = cellProps.row.original
          return warehouses?.[out_warehouse_id]?.name ?? '-'
        },
      },
      {
        Header: t('调入仓库'),
        id: 'in_warehouse_id',
        minWidth: 100,
        Cell: (cellProps: any) => {
          const { in_warehouse_id } = cellProps.row.original
          return warehouses?.[in_warehouse_id]?.name ?? '-'
        },
      },
      {
        Header: t('建单时间'),
        id: 'order_time',
        minWidth: 100,
        Cell: (cellProps: any) => {
          const { create_time } = cellProps.row.original
          return formatDateTime(+create_time)
        },
      },
      {
        Header: t('提交时间'),
        id: 'submit_time',
        minWidth: 100,
        Cell: (cellProps: any) => {
          const { submit_time } = cellProps.row.original
          return formatDateTime(+submit_time)
        },
      },
      {
        Header: t('审核时间'),
        id: 'audit_time',
        minWidth: 100,
        Cell: (cellProps: any) => {
          const { approve_time } = cellProps.row.original
          return formatDateTime(+approve_time)
        },
      },
      {
        Header: t('出库数量(基本单位)'),
        id: 'out_stock.base_unit',
        minWidth: 80,
        Cell: (cellProps: any) => {
          const { out_stock } = cellProps.row.original
          return getInputNumOrUnit(out_stock?.base_unit)
        },
      },
      {
        Header: t('入库数量(基本单位)'),
        id: 'in_stock.base_unit',
        minWidth: 80,
        Cell: (cellProps: any) => {
          const { in_stock } = cellProps.row.original
          return getInputNumOrUnit(in_stock?.base_unit)
        },
      },
      {
        Header: t('损耗数量(基本单位)'),
        id: 'diff_stock.base_unit',
        minWidth: 80,
        Cell: (cellProps: any) => {
          const { diff_stock } = cellProps.row.original
          return getInputNumOrUnit(diff_stock?.base_unit)
        },
      },
      {
        Header: t('建单人'),
        id: 'creator',
        minWidth: 100,
        Cell: (cellProps: { row: { original: any } }) => {
          const { creator_id } = cellProps.row.original
          return groupUsers?.[creator_id]?.name ?? '-'
        },
      },
      {
        Header: t('提交人'),
        id: 'submitter_id',
        minWidth: 100,
        Cell: (cellProps: any) => {
          const { submitter_id } = cellProps.row.original
          return groupUsers?.[submitter_id]?.name ?? '-'
        },
      },
      {
        Header: t('审核人'),
        id: 'auditor_id',
        minWidth: 100,
        Cell: (cellProps: any) => {
          const { auditor_id } = cellProps.row.original
          return groupUsers?.[auditor_id]?.name ?? '-'
        },
      },
    ])
  }, [additional, groupUsers, warehouses])

  return (
    <BoxTable pagination={pagination}>
      <Table
        isDiy
        id='allocation_loss_list'
        keyField='stock_sheet_id'
        columns={_columns}
        fixedSelect
        data={list}
        loading={loading}
      />
    </BoxTable>
  )
})

export default List
