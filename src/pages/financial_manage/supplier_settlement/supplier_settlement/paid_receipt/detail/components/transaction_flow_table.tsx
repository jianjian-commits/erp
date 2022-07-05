import { getFormatTimeForTable, toFixedByType } from '@/common/util'
import { BoxPanel, Price } from '@gm-pc/react'
import { Column, Table } from '@gm-pc/table-x'
import { t } from 'gm-i18n'
import { TransactionFlow_ChangeType } from 'gm_api/src/finance'
import React from 'react'
import store from '../store'

const columns: Column[] = [
  {
    Header: t('操作时间'),
    accessor: 'create_time',
    Cell: (cellProps) => {
      return getFormatTimeForTable(
        'YYYY-MM-DD HH:mm',
        cellProps.original.create_time,
      )
    },
  },
  {
    Header: t('流水号'),
    accessor: 'arrival_serial_no',
    Cell: (cellProps) => cellProps.original.arrival_serial_no ?? '-',
  },
  {
    Header: t('结款金额'),
    accessor: 'change_amount',
    Cell: (cellProps) => {
      const { change_type } = cellProps.original
      const symbol =
        change_type === TransactionFlow_ChangeType.CHANGE_TYPE_SETTLE ? '' : '-'
      return (
        symbol +
          toFixedByType(cellProps.original.change_amount, 'dpSupplierSettle') +
          Price.getUnit() ?? '-'
      )
    },
  },
  {
    Header: t('备注'),
    accessor: 'remark',
    Cell: ({ original }) => {
      return original.remark ?? '-'
    },
  },
  {
    Header: t('操作人'),
    accessor: 'creator_name',
    Cell: ({ original }) => {
      return original.creator_name ?? '-'
    },
  },
]

const TransactionFlowTable = () => {
  const { transactionFlowList } = store
  return (
    <BoxPanel
      title={t('交易流水')}
      summary={[{ text: t('合计'), value: transactionFlowList.length }]}
      collapse
    >
      <Table data={transactionFlowList.slice()} columns={columns} />
    </BoxPanel>
  )
}

export default TransactionFlowTable
