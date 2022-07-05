import React from 'react'
import { Table } from '@gm-pc/table-x'
import { TimeSpanPicker, Flex } from '@gm-pc/react'
import { observer } from 'mobx-react'
import { t } from 'gm-i18n'
import DaySelect from './day_select'
import { MToDate, dayMM, dateTMM } from '@/common/util'
import store from '../store'
import type { ServicePeriod } from 'gm_api/src/enterprise'

const ReceiveTimeTable = () => {
  function handleChange<T extends keyof ServicePeriod>(
    key: T,
    value: ServicePeriod[T],
  ) {
    store.updatePeriod(key, value)
  }

  const {
    order_receive_min_time,
    order_receive_max_time,
    order_receive_min_date,
    order_create_min_time,
  } = store.servicePeriod

  return (
    <Table
      isEdit
      className='gm-border'
      data={[{ order_receive_min_time, order_receive_max_time }]}
      columns={[
        {
          Header: t('最早收货时间'),
          id: 'order_receive_min_time',
          Cell: (props) => {
            return (
              <TimeSpanPicker
                min={
                  +order_receive_min_date! === 0
                    ? MToDate(+order_create_min_time! + 30 * 60 * 1000)
                    : undefined
                }
                date={MToDate(+props.original.order_receive_min_time)}
                onChange={(v) => {
                  handleChange('order_receive_min_time', dateTMM(v as Date))
                }}
                style={{ width: '80px' }}
              />
            )
          },
        },
        {
          id: 'order_receive_max_time',
          Header: t('最晚收货时间'),
          Cell: (props) => {
            const { order_receive_min_time, order_receive_max_time } =
              props.original
            const createFlag = +order_receive_max_time >= dayMM ? 1 : 0
            return (
              <Flex>
                <DaySelect
                  value={createFlag}
                  max={2}
                  onChange={(v) => {
                    if (v) {
                      handleChange(
                        'order_receive_max_time',
                        `${+order_receive_min_time! + dayMM}`,
                      )
                    } else {
                      handleChange(
                        'order_receive_max_time',
                        `${dayMM - 30 * 60 * 1000}`,
                      )
                    }
                  }}
                />
                <div className='gm-gap-10' />
                <TimeSpanPicker
                  min={
                    createFlag === 0
                      ? MToDate(+order_receive_min_time)
                      : undefined
                  }
                  max={
                    createFlag === 1
                      ? MToDate(+order_receive_min_time)
                      : undefined
                  }
                  date={MToDate(+order_receive_max_time)}
                  onChange={(v) => {
                    let val = dateTMM(v as Date)
                    if (+order_receive_max_time >= dayMM) {
                      val = `${+val + dayMM}`
                    }
                    handleChange('order_receive_max_time', val)
                  }}
                  style={{ width: '80px' }}
                />
              </Flex>
            )
          },
        },
      ]}
    />
  )
}

export default observer(ReceiveTimeTable)
