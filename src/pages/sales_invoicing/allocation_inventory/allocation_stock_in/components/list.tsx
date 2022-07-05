import React, { FC } from 'react'
import { Table } from '@gm-pc/table-x'
import {
  Price,
  BoxTableInfo,
  BoxTable,
  BoxTableProps,
  PaginationProps,
} from '@gm-pc/react'
import { t } from 'gm-i18n'

import { formatDateTime, getUnNillText, toFixedByType } from '@/common/util'
import store from '../stores/store'
import { observer } from 'mobx-react'
import { ListStatusTabs } from '@/pages/sales_invoicing/components'
import TableTotalText from '@/common/components/table_total_text'
import { ReceiptStatusAllKey } from '@/pages/sales_invoicing/interface'
import {
  STOCK_IN_RECEIPT_TABS,
  AllOCATE_STOCK_IN_RECEIPT_TABS_NAME,
} from '@/pages/sales_invoicing/enum'

const ListTable = observer(
  (props: {
    onFetchList: () => any
    loading: boolean
    pagination: PaginationProps | undefined
  }) => {
    const { pagination } = props
    const { list, getRelationInfo } = store

    const _columns = [
      {
        Header: t('建单时间'),
        accessor: 'create_time',
        minWidth: 100,
        Cell: (cellProps: any) => {
          const { create_time } = cellProps.original
          return formatDateTime(+create_time)
        },
      },
      {
        Header: t('入库时间'),
        accessor: 'submit_time',
        minWidth: 100,
        Cell: (cellProps: any) => {
          const { submit_time } = cellProps.original
          return formatDateTime(+submit_time)
        },
      },
      {
        Header: t('调拨入库单号'),
        accessor: 'stock_sheet_serial_no',
        minWidth: 100,
        Cell: (cellProps: any) => {
          const { stock_sheet_serial_no, stock_sheet_id } = cellProps.original
          return (
            <a
              className='gm-text-primary gm-cursor'
              href={`#/sales_invoicing/allocation_inventory/allocation_stock_in/detail?sheet_id=${stock_sheet_id}`}
            >
              {stock_sheet_serial_no}
            </a>
          )
        },
      },
      {
        Header: t('调出仓库'),
        accessor: 'out_warehouse_id',
        minWidth: 140,
        Cell: (cellProps: any) => {
          const { out_warehouse_id } = cellProps.original
          const warehouse = getRelationInfo('warehouses', out_warehouse_id)
          return getUnNillText(warehouse?.name)
        },
      },
      {
        Header: t('调入仓库'),
        accessor: 'in_warehouse_id',
        minWidth: 110,
        Cell: (cellProps: any) => {
          const { in_warehouse_id } = cellProps.original
          const warehouse = getRelationInfo('warehouses', in_warehouse_id)
          return getUnNillText(warehouse?.name)
        },
      },
      {
        Header: t('商品成本'),
        accessor: 'total_price_no_tax',
        minWidth: 100,
        Cell: (cellProps: any) => {
          const { tax_total_price } = cellProps.original
          return getUnNillText(tax_total_price) + Price.getUnit()
        },
      },
      {
        Header: t('调拨费用'),
        accessor: 'warehouse_transfer_amount',
        diyEnable: false,
        minWidth: 100,
        Cell: (cellProps: any) => {
          const { warehouse_transfer_amount } = cellProps.original
          return (
            toFixedByType(warehouse_transfer_amount, 'dpInventoryAmount') +
            Price.getUnit()
          )
        },
      },
      {
        Header: t('单据状态'),
        accessor: 'sheet_status',
        diyEnable: false,
        minWidth: 100,
        Cell: (cellProps: any) => {
          const { sheet_status } = cellProps.original
          return getUnNillText(
            AllOCATE_STOCK_IN_RECEIPT_TABS_NAME[sheet_status],
          )
        },
      },
      {
        Header: t('备注'),
        accessor: 'remark',
        minWidth: 100,
        Cell: (cellProps: any) => {
          const { remark } = cellProps.original
          return remark || '-'
        },
      },
      {
        Header: t('建单人'),
        accessor: 'creator_id',
        minWidth: 100,
        Cell: (cellProps: any) => {
          const { creator_id } = cellProps.original
          const user = getRelationInfo('group_users', creator_id)
          return getUnNillText(user?.name)
        },
      },
    ]

    return (
      <BoxTable
        pagination={pagination}
        info={
          <BoxTableInfo>
            <TableTotalText
              data={[
                {
                  label: t('单据总数'),
                  content: pagination?.paging?.count,
                },
              ]}
            />
          </BoxTableInfo>
        }
      >
        <Table
          isDiy
          id='purchase_stock_in_list'
          keyField='stock_sheet_id'
          columns={_columns}
          fixedSelect
          data={list}
          loading={props.loading}
        />
      </BoxTable>
    )
  },
)

interface ListProps extends Pick<BoxTableProps, 'pagination'> {
  onFetchList: () => any
  loading: boolean
}
const List: FC<ListProps> = observer((props) => {
  const { activeType } = store
  const { onFetchList, loading, pagination } = props
  const handleChange = (type: ReceiptStatusAllKey) => {
    store.changeActiveType(type)
    onFetchList()
  }

  return (
    <ListStatusTabs
      active={activeType}
      onChange={handleChange}
      tabComponent={
        <ListTable
          onFetchList={onFetchList}
          loading={loading}
          pagination={pagination}
        />
      }
      tabData={STOCK_IN_RECEIPT_TABS}
      omitTabs={['cancelApproval', 'deleted']}
    />
  )
})

export default List
