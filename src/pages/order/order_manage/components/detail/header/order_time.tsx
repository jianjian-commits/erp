import React from 'react'
import { DatePicker } from '@gm-pc/react'
import { observer } from 'mobx-react'
import moment from 'moment'
import store from '../store'
import { disabledOrderTimeSpan } from '../../../../util'

const OrderTime = () => {
  function handleChange(date: Date) {
    store.updateOrderInfo('order_time', date ? `${+date}` : undefined)
  }
  function limitTime(time?: Date, date?: Date): any {
    const { service_period } = store.order
    if (!service_period) return true
    return disabledOrderTimeSpan(time!, date!, service_period)
  }
  const {
    order: { view_type, create_time, repair, service_period_id, order_time },
  } = store
  if (view_type === 'create') {
    if (repair) {
      return (
        <DatePicker
          disabledClose
          disabled={!service_period_id}
          date={order_time ? new Date(+order_time) : undefined}
          onChange={handleChange}
          disabledDate={(m) => moment(m) > moment().startOf('day')}
          enabledTimeSelect
          timeLimit={{
            timeSpan: 30 * 60 * 1000,
            disabledSpan: (time?: Date, date?: Date) => {
              return limitTime(time, date)
            },
          }}
          placeholder='选择下单时间'
        />
      )
    }
    return <div className='gm-padding-right-5'>-</div>
  }
  return (
    <div className='gm-padding-right-5'>
      {moment(new Date(+order_time!)).format('YYYY-MM-DD HH:mm')}
    </div>
  )
}

export default observer(OrderTime)
