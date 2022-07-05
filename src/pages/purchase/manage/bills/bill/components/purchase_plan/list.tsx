import { t } from 'gm-i18n'
import React, { useMemo, useRef, FC } from 'react'
import moment from 'moment'
import { observer } from 'mobx-react'
import { Table, TableXUtil, Column } from '@gm-pc/table-x'
import SelectedTableDel from '@/common/components/icon/selected_table_del'
import SelectedTableAdd from '@/common/components/icon/selected_table_add'
import store from './store'
import { PurchaseTask, map_PurchaseTask_Status } from 'gm_api/src/purchase'
import { getBaseUnitName } from '@/pages/purchase/util'
import { toFixed } from '@/common/util'

const List: FC<{
  type: 'selected' | 'unSelected'
  data: PurchaseTask[]
}> = ({ type, data }) => {
  const ref = useRef<any>(null)
  const columns: Column<PurchaseTask>[] = useMemo(() => {
    return [
      {
        Header: t('计划编号'),
        accessor: 'serial_no',
      },
      {
        Header: t('计划交期'),
        id: 'purchase_time',
        accessor: (d) => {
          return moment(new Date(+d.purchase_time!)).format('YYYY-MM-DD HH:mm')
        },
      },
      {
        Header: t('商品名'),
        id: 'sku.name',
        accessor: (d: any) => d.sku?.sku.name || '-',
      },
      {
        Header: t('计划采购数'),
        id: 'plan_value',
        accessor: (d) =>
          toFixed(+d.plan_value?.input?.quantity!) +
            getBaseUnitName(d.plan_value?.input?.unit_id!) || '-',
      },
      {
        Header: t('状态'),
        id: 'status',
        accessor: (d) => map_PurchaseTask_Status[d.status] || '-',
      },
      {
        Header: TableXUtil.OperationHeader,
        id: 'action',
        Cell: (props) => {
          const task = props.original
          return type === 'selected' ? (
            <div
              className='gm-text-center'
              onClick={() => store.setSelected([])}
            >
              <SelectedTableDel />
            </div>
          ) : (
            <div
              className='gm-text-center'
              onClick={() => {
                store.setSelected([task.purchase_task_id])
              }}
            >
              <SelectedTableAdd />
            </div>
          )
        },
      },
    ]
  }, [type])

  return (
    <Table
      isVirtualized
      id='purchase_plan_table'
      keyField='purchase_task_id'
      refVirtualized={ref}
      data={data}
      limit={6}
      columns={columns}
    />
  )
}

export default observer(List)
