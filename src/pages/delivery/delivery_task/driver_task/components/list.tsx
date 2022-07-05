import React from 'react'
import { t } from 'gm-i18n'
import { observer } from 'mobx-react'
import { BoxTable, BoxTableProps } from '@gm-pc/react'
import { Column, Table } from '@gm-pc/table-x'
import { ListDriverDeliveryTaskResponse_DriverDeliveryTask } from 'gm_api/src/delivery'
import store from '../store'

const List = ({ pagination }: Pick<BoxTableProps, 'pagination'>) => {
  const { driver_delivery_tasks, distribution_contractors } = store
  const columns: Column<ListDriverDeliveryTaskResponse_DriverDeliveryTask>[] = [
    {
      Header: t('司机名'),
      id: 'name',
      minWidth: 80,
      Cell: (cellProps) => {
        return <div>{cellProps.original.driver?.name}</div>
      },
    },
    {
      Header: t('承运商'),
      accessor: 'carrier_id',
      minWidth: 80,
      Cell: (cellProps) => {
        return (
          <div>
            {distribution_contractors[
              cellProps.original.driver?.distribution_contractor_id!
            ]?.name || t('无')}
          </div>
        )
      },
    },
    {
      Header: t('配送商户数'),
      accessor: 'customer_count',
      minWidth: 80,
      Cell: (cellProps) => {
        return <div>{cellProps.original.customer_count}</div>
      },
    },
    {
      Header: t('订单数'),
      accessor: 'order_number',
      minWidth: 80,
      Cell: (cellProps) => {
        return <div>{cellProps.original.order_count}</div>
      },
    },
    {
      Header: t('销售额（不含运费）'),
      accessor: 'delivery_task_amount',
      minWidth: 80,
      Cell: (cellProps) => {
        return <div>{cellProps.original.total_amount}</div>
      },
    },
  ]
  return (
    <BoxTable pagination={pagination}>
      <Table data={driver_delivery_tasks} columns={columns} />
    </BoxTable>
  )
}
export default observer(List)
