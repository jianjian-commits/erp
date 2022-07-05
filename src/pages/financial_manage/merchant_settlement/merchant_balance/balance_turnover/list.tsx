import React, { FC, useMemo } from 'react'
import { Table, Column } from '@gm-pc/table-x'
import { t } from 'gm-i18n'
import { observer } from 'mobx-react'
import { BoxTable, BoxTableInfo, Price, BoxTableProps } from '@gm-pc/react'
import TableTotalText from '@/common/components/table_total_text'
import { useGMLocation } from '@gm-common/router'
import Big from 'big.js'
import moment from 'moment'
import store from '../store'
import { TransactionFlowMap } from '../enum'
import { ListTurnoverOptions } from '../interface'

interface QueryParams {
  company_code: string
  company_name: string
}

interface ListProps extends Pick<BoxTableProps, 'pagination'> {
  onFetchList?: () => any
}

const List: FC<ListProps> = observer(({ pagination }) => {
  const { turnover_ist } = store
  const location = useGMLocation<QueryParams>()
  const { company_code, company_name } = location.query

  const _columns: Column<ListTurnoverOptions>[] = useMemo(() => {
    return [
      {
        Header: t('变动类型'),
        accessor: 'change_type',
        minWidth: 100,
        diyEnable: true,
        Cell: (cellProps) => {
          const {
            original: { change_type },
          } = cellProps
          return TransactionFlowMap[change_type!] || '-'
        },
      },
      {
        Header: t('变动金额'),
        accessor: 'change_amount',
        minWidth: 100,
        diyEnable: true,
        Cell: (cellProps) => {
          const {
            original: { change_amount },
          } = cellProps
          return (
            Big(Number(change_amount) || 0).toFixed(2) + Price.getUnit() || '-'
          )
        },
      },
      {
        Header: t('变动后金额'),
        accessor: 'change_after_amount',
        minWidth: 100,
        diyEnable: true,
        Cell: (cellProps) => {
          const {
            original: { change_after_amount },
          } = cellProps
          return (
            Big(Number(change_after_amount) || 0).toFixed(2) +
              Price.getUnit() || '-'
          )
        },
      },
      {
        Header: t('关联单据'),
        accessor: 'settle_sheet_serial_no',
        minWidth: 100,
        diyEnable: true,
        Cell: (cellProps) => {
          const {
            original: { settle_sheet_serial_no },
          } = cellProps
          return settle_sheet_serial_no || '-'
        },
      },
      {
        Header: t('到账凭证'),
        accessor: 'arrival_serial_no',
        minWidth: 100,
        diyEnable: true,
        Cell: (cellProps) => {
          const {
            original: { arrival_serial_no },
          } = cellProps
          return arrival_serial_no || '-'
        },
      },
      {
        Header: t('流水号'),
        accessor: 'transaction_flow_id',
        minWidth: 100,
        diyEnable: true,
      },
      {
        Header: t('操作时间'),
        accessor: 'create_time',
        minWidth: 100,
        diyEnable: true,
        Cell: (cellProps) => {
          const {
            original: { create_time },
          } = cellProps
          return (
            <div>
              {moment(+create_time!).format('YYYY-MM-DD HH:mm:ss') || '-'}
            </div>
          )
        },
      },
      {
        Header: t('操作人'),
        accessor: 'operator',
        minWidth: 100,
        diyEnable: true,
      },
      {
        Header: t('备注'),
        accessor: 'remark',
        minWidth: 100,
        diyEnable: true,
        Cell: (cellProps) => {
          const {
            original: { remark },
          } = cellProps
          return remark || '-'
        },
      },
    ]
  }, [])

  return (
    <BoxTable
      pagination={pagination}
      info={
        <BoxTableInfo>
          <TableTotalText
            data={[
              {
                label: t('公司编码'),
                content: company_code,
              },
              {
                label: t('公司名称'),
                content: company_name,
              },
            ]}
          />
        </BoxTableInfo>
      }
    >
      <Table
        isDiy
        id='balance_turnover_id'
        keyField='serial_number'
        columns={_columns}
        data={turnover_ist}
      />
    </BoxTable>
  )
})

export default List
