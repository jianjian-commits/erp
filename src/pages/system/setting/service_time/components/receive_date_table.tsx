import React from 'react'
import { Table } from '@gm-pc/table-x'
import { observer } from 'mobx-react'
import { t } from 'gm-i18n'
import DaySelect from './day_select'
import { dayMM, dateTMM, MToDate } from '@/common/util'
import { getDayList } from '../util'
import store from '../store'
import type { ServicePeriod } from 'gm_api/src/enterprise'

const ReceiveDateTable = () => {
  function handleChange<T extends keyof ServicePeriod>(
    key: T,
    value: ServicePeriod[T],
  ) {
    if (
      key === 'order_receive_min_date' &&
      +value > +store.servicePeriod.order_receive_max_date!
    ) {
      store.updatePeriod('order_receive_max_date', value!)
    }
    store.updatePeriod(key, value)
  }

  function handleTimeChange<T extends keyof ServicePeriod>(
    key: T,
    value: Date | null,
  ) {
    let val = dateTMM(value as Date)
    if (+store.servicePeriod[key] >= dayMM) {
      val = `${+val + dayMM}`
    }
    store.updatePeriod(key, val)
  }

  function handleReceiveMinDate(value: string) {
    handleChange('order_receive_min_date', value)
    if (+value === 0) {
      const mm = +store.servicePeriod.order_create_min_time! + 30 * 60 * 1000
      if (+store.servicePeriod.order_receive_min_time! < mm)
        handleTimeChange('order_receive_min_time', MToDate(mm))
    }
  }

  const { receiveTime } = store

  const days = getDayList(30)
  return (
    <Table
      isEdit
      className='gm-border'
      data={receiveTime}
      columns={[
        {
          Header: t('最早收货日'),
          id: 'order_receive_min_date',
          Cell: (props) => {
            return (
              <DaySelect
                days={days}
                value={+props.original.order_receive_min_date}
                max={30}
                onChange={handleReceiveMinDate}
              />
            )
          },
        },
        {
          id: 'order_receive_max_date',
          Header: t('最晚收货日'),
          Cell: (props) => {
            return (
              <DaySelect
                days={days.slice(+props.original.order_receive_min_date || 0)}
                value={+props.original.order_receive_max_date}
                max={30}
                onChange={(v) => handleChange('order_receive_max_date', v)}
              />
            )
          },
        },
      ]}
    />
  )
}

export default observer(ReceiveDateTable)
