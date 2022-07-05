import React, { FC, useMemo } from 'react'
import { Table } from '@gm-pc/table-x'
import { t } from 'gm-i18n'

import store from '../stores/store'
import { observer } from 'mobx-react'
import { ListStatusTabs } from '@/pages/sales_invoicing/components'
import {
  AllOCATE_STOCK_OUT_RECEIPT_TABS_NAME,
  RECEIPT_STATUS,
  STOCK_OUT_RECEIPT_TABS,
} from '../../../enum'
import { BoxTableInfo, BoxTable, Price, BoxTableProps } from '@gm-pc/react'
import TableTotalText from '@/common/components/table_total_text'
import { ReceiptStatusAllKey } from '@/pages/sales_invoicing/interface'
import _ from 'lodash'
import { toFixedByType, formatDateTime, getUnNillText } from '@/common/util'
import StockSheetLink from '@/pages/sales_invoicing/components/stock_sheet_link'

interface ListProps extends Pick<BoxTableProps, 'pagination'> {
  onFetchList: () => any
  loading: boolean
}

const ListTable = observer((props: ListProps) => {
  const { list, paging, groupUsers, warehouses } = store
  const _columns = useMemo(() => {
    return _.without([
      {
        Header: t('建单时间'),
        accessor: 'create_time',
        minWidth: 100,
        Cell: (cellProps: any) => {
          const { create_time } = cellProps.row.original
          return formatDateTime(+create_time)
        },
      },
      {
        Header: t('出库时间'),
        accessor: 'create_time',
        minWidth: 100,
        Cell: (cellProps: any) => {
          const { submit_time } = cellProps.row.original
          return formatDateTime(+submit_time)
        },
      },
      {
        Header: t('调拨出库单号'),
        accessor: 'in_warehouse_id',
        minWidth: 100,
        Cell: (cellProps: any) => {
          const { stock_sheet_id, stock_sheet_serial_no, sheet_status } =
            cellProps.row.original
          return (
            <StockSheetLink
              url='/sales_invoicing/allocation_inventory/allocation_stock_out'
              sheetStatus={sheet_status}
              showText={stock_sheet_serial_no}
              stockSheetId={stock_sheet_id}
            />
          )
        },
      },
      {
        Header: t('调出仓库'),
        accessor: 'out_warehouse_id',
        minWidth: 100,
        Cell: (cellProps: any) => {
          const { out_warehouse_id } = cellProps.row.original
          return warehouses?.[out_warehouse_id]?.name ?? '-'
        },
      },
      {
        Header: t('调入仓库'),
        accessor: 'in_warehouse_id',
        minWidth: 100,
        Cell: (cellProps: any) => {
          const { in_warehouse_id } = cellProps.row.original
          return warehouses?.[in_warehouse_id]?.name ?? '-'
        },
      },
      {
        Header: t('商品成本'),
        accessor: 'no_tax_total_price',
        minWidth: 100,
        Cell: (cellProps: any) => {
          const { tax_total_price } = cellProps.original
          return getUnNillText(tax_total_price) + Price.getUnit()
        },
      },
      {
        Header: t('调拨费用'),
        accessor: 'out_stock_status',
        diyEnable: false,
        minWidth: 100,
        Cell: (cellProps: any) => {
          const { warehouse_transfer_amount } = cellProps.original
          return warehouse_transfer_amount
            ? toFixedByType(warehouse_transfer_amount, 'salesInvoicing') +
                Price.getUnit()
            : '-'
        },
      },
      {
        Header: t('单据状态'),
        accessor: 'in_stock_status',
        diyEnable: false,
        minWidth: 100,
        Cell: (cellProps: any) => {
          const { sheet_status } = cellProps.original
          return getUnNillText(
            AllOCATE_STOCK_OUT_RECEIPT_TABS_NAME[sheet_status],
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
          const { creator_id } = cellProps.row.original
          return groupUsers?.[creator_id]?.name ?? '-'
        },
      },
    ])
  }, [groupUsers, warehouses])

  return (
    <BoxTable
      pagination={props.pagination}
      info={
        <BoxTableInfo>
          <TableTotalText
            data={[
              {
                label: t('单据总数'),
                content: props.pagination?.paging?.count,
              },
            ]}
          />
        </BoxTableInfo>
      }
    >
      <Table
        isDiy
        id='allocation_stock_out_list'
        keyField='stock_sheet_id'
        columns={_columns}
        fixedSelect
        data={list.slice()}
        loading={props.loading}
      />
    </BoxTable>
  )
})

const List: FC<ListProps> = observer((props) => {
  const { activeType } = store
  const { onFetchList, loading, pagination } = props
  const handleChange = (type: ReceiptStatusAllKey) => {
    store.changeFilter('stock_sheet_status', RECEIPT_STATUS[type])
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
      tabData={STOCK_OUT_RECEIPT_TABS}
      omitTabs={['cancelApproval', 'deleted']}
    />
  )
})

export default List
