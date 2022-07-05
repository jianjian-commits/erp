import { Column, TableXUtil, Table } from '@gm-pc/table-x'
import { t } from 'gm-i18n'
import React, { useMemo } from 'react'

import SelectedTableDel from '@/common/components/icon/selected_table_del'
import SelectedTableAdd from '@/common/components/icon/selected_table_add'
import { TaskDetail } from '../../sales_invoicing_type'

import { getFormatTimeForTable, toFixedSalesInvoicing } from '@/common/util'
import { map_Task_State } from 'gm_api/src/production'

const { OperationHeader } = TableXUtil
interface SelectedPlanTableProps {
  data: any
  type: 'unSelected'
  selectKey: keyof TaskDetail
  needPagination: boolean
  onAdd: (data: TaskDetail) => void
}

interface UnSelectedPlanTableProps {
  data: any
  type: 'selected'
  selectKey: keyof TaskDetail
  needPagination: boolean
  onDel: (id: string) => void
}

interface Props {
  data: any
  type: 'unSelected' | 'selected'
  selectKey: keyof TaskDetail
  onAdd?: (data: TaskDetail) => void
  onDel?: (id: string) => void
}

function PlanTable(props: SelectedPlanTableProps): JSX.Element
function PlanTable(props: UnSelectedPlanTableProps): JSX.Element
function PlanTable(props: Props) {
  const { data, type, selectKey, onDel, onAdd, needPagination } = props
  const isSelected = type === 'selected'

  const limit = isSelected ? 100 : 6

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
      {
        Header: OperationHeader,
        accessor: 'operator',
        Cell: (cellProps) => {
          const id = cellProps.original[selectKey]
          return isSelected ? (
            <div className='gm-text-center' onClick={() => onDel!(id)}>
              <SelectedTableDel />
            </div>
          ) : (
            <div
              className='gm-text-center'
              onClick={() => onAdd!(cellProps.original)}
            >
              <SelectedTableAdd />
            </div>
          )
        },
      },
    ],
    [],
  )

  if (needPagination) {
    return <Table data={data} columns={_columns} />
  }

  return <Table isVirtualized data={data} columns={_columns} limit={limit} />
}

export default PlanTable
