import React from 'react'
import { DatePicker, Flex } from '@gm-pc/react'
import moment from 'moment'
import { observer } from 'mobx-react'
import store from '../store'
import { Order_State } from 'gm_api/src/order'
import { disabledReceiveTimeSpan } from '../../../../util'

const ReceiveTime = () => {
  function handleChange(date: Date) {
    store.updateOrderInfo('receive_time', date ? `${+date}` : undefined)
  }
  function limitTime(time?: Date, date?: Date): any {
    const { service_period, order_time, repair } = store.order
    if (!service_period) return true
    if (
      !repair &&
      moment(time) <= moment(order_time ? new Date(+order_time!) : undefined)
    ) {
      return true
    }
    return disabledReceiveTimeSpan(time!, date!, service_period)
  }
  const { order } = store

  if (
    order.view_type === 'view' ||
    order.state! >= Order_State.STATE_DELIVERYING
  ) {
    return (
      <Flex alignCenter>
        {moment(new Date(+order.receive_time!)).format('YYYY-MM-DD HH:mm')}
      </Flex>
    )
  }
  return (
    <Flex flex>
      <DatePicker
        disabledClose
        disabled={!order.service_period_id}
        date={order.receive_time ? new Date(+order.receive_time) : undefined}
        onChange={handleChange}
        disabledDate={(m) => {
          const { order_time, service_period, repair } = order
          if (repair) return false
          const { order_receive_min_date, order_receive_max_date } =
            service_period!
          const orderTime = order_time ? new Date(+order_time) : undefined
          return !(
            moment(m) >=
              moment(orderTime)
                .add(order_receive_min_date || 0, 'day')
                .startOf('day') &&
            moment(m) <=
              moment(orderTime)
                .add(order_receive_max_date || 0, 'day')
                .startOf('day')
          )
        }}
        timeLimit={{
          timeSpan: 30 * 60 * 1000,
          disabledSpan: (time?: Date, date?: Date) => {
            return limitTime(time, date)
          },
        }}
        enabledTimeSelect
        placeholder='选择收货时间'
      />
    </Flex>
  )
}

export default observer(ReceiveTime)
