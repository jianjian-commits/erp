import React, { FC } from 'react'
import { t } from 'gm-i18n'
import { observer } from 'mobx-react'
import { Column, Table, TableXUtil } from '@gm-pc/table-x'
import { Price } from '@gm-pc/react'
import Big from 'big.js'
import moment from 'moment'
import store from '../store'
import { TransactionFlow_ChangeType } from 'gm_api/src/finance'
import { TransactionFlowMap } from '../enum'
import { TransactionFlowOptions } from '../interface'
const { OperationIcon, OperationCell } = TableXUtil

const TransactionFlowTable: FC = observer(() => {
  const { flow_list } = store

  const handleWriteOff = (index: number) => {
    store.writeOffSettleSheet(index)
  }
  const _columns: Column<TransactionFlowOptions>[] = [
    {
      Header: <div className='text-center'>{t('序号')}</div>,
      accessor: 'sequence',
      minWidth: 50,
      Cell: (cellProps) => (
        <div className='text-center'>{cellProps.index + 1}</div>
      ),
    },
    {
      Header: t('变动时间'),
      accessor: 'create_time',
      minWidth: 100,
      Cell: (cellProps) =>
        moment(new Date(+cellProps?.original?.create_time!)).format(
          'YYYY-MM-DD HH:mm:ss',
        ),
    },
    {
      Header: t('变动类型'),
      accessor: 'change_type',
      minWidth: 100,
      Cell: (cellProps) => {
        const {
          original: { change_type },
        } = cellProps
        return <span>{TransactionFlowMap[change_type!] || '-'}</span>
      },
    },
    {
      Header: t('变动金额'),
      accessor: 'change_amount',
      minWidth: 100,
      Cell: (cellProps) => {
        const { change_amount } = cellProps.original
        return (
          Big(Number(change_amount) || 0).toFixed(2) + Price.getUnit() || '-'
        )
      },
    },
    {
      Header: t('操作人'),
      accessor: 'creator_name',
      minWidth: 100,
      Cell: (cellProps) => {
        const {
          original: { creator_name },
        } = cellProps
        return <span>{creator_name || '-'}</span>
      },
    },

    {
      Header: t('交易流水号'),
      accessor: 'transaction_flow_id',
      minWidth: 100,
      Cell: (cellProps) => {
        const {
          original: { transaction_flow_id },
        } = cellProps
        return <span>{transaction_flow_id || '-'}</span>
      },
    },
    {
      Header: t('备注'),
      accessor: 'remark',
      minWidth: 100,
      Cell: (cellProps) => {
        const {
          original: { remark },
        } = cellProps
        return <span>{remark || '-'}</span>
      },
    },
    {
      Header: TableXUtil.OperationHeader,
      id: 'op',
      width: TableXUtil.TABLE_X.WIDTH_OPERATION,
      fixed: 'right',
      Cell: (cellProps) => {
        const {
          original: { change_type, used },
          index,
        } = cellProps
        return (
          <OperationCell>
            {/* 流水的类型必须为结款状态CHANGE_TYPE_SETTLE */}
            {change_type === TransactionFlow_ChangeType.CHANGE_TYPE_SETTLE &&
              used === false && (
                <OperationIcon
                  tip={t('冲账')}
                  onClick={() => handleWriteOff(index!)}
                >
                  <span className='gm-text-primary'> {t('冲账')}</span>
                </OperationIcon>
              )}
          </OperationCell>
        )
      },
    },
  ]
  return <Table data={flow_list} columns={_columns} id='transaction_flow_id' />
})

export default TransactionFlowTable
