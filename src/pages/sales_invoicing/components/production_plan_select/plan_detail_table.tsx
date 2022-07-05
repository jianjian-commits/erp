import { getFormatTimeForTable, toFixedSalesInvoicing } from '@/common/util'

import { Table, Column } from '@gm-pc/table-x'
import { t } from 'gm-i18n'
import { map_Task_State } from 'gm_api/src/production'
import React, { FC, useMemo } from 'react'

interface Props {
  data: any
}

const PlanDetailTable: FC<Props> = (props) => {
  const { data } = props

  const _columns: Column[] = useMemo(
    () => [
      {
        Header: t('计划编号'),
        accessor: 'serial_no',
        Cell: (cellProps) => {
          const { serial_no, isMaterial } = cellProps.original
          return (
            <div>
              <div>{serial_no}</div>
              {isMaterial && (
                <div className='gm-text-red'>{t('非当前计划原料')}</div>
              )}
            </div>
          )
        },
      },
      {
        Header: t('创建时间'),
        accessor: 'create_time',
        Cell: (cellProps) => {
          return getFormatTimeForTable(
            'YYYY-MM-DD HH:mm',
            cellProps.original.create_time,
          )
        },
      },
      {
        Header: t('生产成品'),
        accessor: 'sku_name',
      },
      {
        Header: t('计划生产数'),
        accessor: 'plan_amount',
        Cell: (cellProps) => {
          const { plan_amount, unit_name } = cellProps.original
          return toFixedSalesInvoicing(plan_amount) + unit_name
        },
      },
      {
        Header: t('计划状态'),
        accessor: 'state',
        Cell: (cellProps) => {
          const { state } = cellProps.original
          return <div>{map_Task_State[state!]}</div>
        },
      },
    ],
    [],
  )
  return <Table data={data} columns={_columns} />
}

export default PlanDetailTable
