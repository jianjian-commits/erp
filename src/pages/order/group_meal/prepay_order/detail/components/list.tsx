import React from 'react'
import { TableList, TableListColumn } from '@gm-pc/business'
import { observer } from 'mobx-react'
import { AdvancedOrderDetail } from 'gm_api/src/eshop'
import { t } from 'gm-i18n'
import store from '../store'
import { State } from '../../enum'
import moment from 'moment'
const List = observer(() => {
  const { advanced_order } = store
  const columns: TableListColumn<AdvancedOrderDetail>[] = [
    {
      Header: t('配送日期'),
      id: 'Date',
      Cell: (cellProps) => {
        return (
          <>{moment(+cellProps.original.meal_date!).format('YYYY-MM-DD')}</>
        )
      },
    },
    {
      Header: t('餐次'),
      id: 'food',
      Cell: (cellProps) => {
        return <>{cellProps.original.menu_period_group_name || '-'}</>
      },
    },
    {
      Header: t('状态'),
      id: 'status',
      Cell: (cellProps) => {
        const state = +cellProps.original.state! || 0
        return <>{State[state] || '-'}</>
      },
    },
    {
      Header: t('备注'),
      id: 'remark',
      Cell: (cellProps) => {
        return <>{cellProps.original.remark || '-'}</>
      },
    },
  ]
  return (
    <TableList
      service={() => {
        return Promise.resolve()
      }}
      isPagination={false}
      columns={columns}
      isUpdateEffect={false}
      data={advanced_order.advanced_order_details || []}
    />
  )
})

export default List
