import React, { FC } from 'react'
import { DatePicker, Flex } from '@gm-pc/react'
import moment from 'moment'
import { disabledReceiveTimeSpan } from '../../../util'
import { ServicePeriod } from 'gm_api/src/enterprise'

interface ReceiveTimeProps {
  value?: Date
  onChange: (date: Date) => void
  servicePeriod: ServicePeriod
  disabled?: boolean
}

const ReceiveTime: FC<ReceiveTimeProps> = ({
  onChange,
  servicePeriod,
  disabled,
  value,
}) => {
  function handleChange(date: Date) {
    onChange(date)
  }
  function limitTime(time?: Date, date?: Date): any {
    if (!servicePeriod) return true
    if (moment(time) <= moment()) {
      return true
    }
    return disabledReceiveTimeSpan(time!, date!, servicePeriod)
  }

  return (
    <Flex flex>
      <DatePicker
        disabledClose
        disabled={!!disabled}
        date={value}
        onChange={handleChange}
        disabledDate={(m) => {
          const {
            order_receive_min_date,
            order_receive_max_date,
          } = servicePeriod!
          return !(
            moment(m) >=
              moment()
                .add(order_receive_min_date || 0, 'day')
                .startOf('day') &&
            moment(m) <=
              moment()
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

export default ReceiveTime
