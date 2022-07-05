import React from 'react'
import { observer } from 'mobx-react'
import moment from 'moment'
import store from '../store'

const OperateTime = () => {
  const {
    order: { view_type, update_time, group_users, customer, updater_id },
  } = store

  const updater =
    customer?.customer_id === updater_id
      ? customer?.name
      : group_users[updater_id!]?.name || '-'
  if (view_type === 'create') return <div>-</div>
  return (
    <div>
      {updater +
        '(' +
        moment(new Date(+update_time!)).format('YYYY-MM-DD HH:mm') +
        ')'}
    </div>
  )
}

export default observer(OperateTime)
