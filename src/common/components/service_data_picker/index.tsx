import React, { FC, useMemo, useState, useEffect } from 'react'
import { Select, MoreSelectDataItem, Flex, DatePicker } from '@gm-pc/react'
import { useAsync } from '@gm-common/hooks'
import { ListServicePeriod, ServicePeriod } from 'gm_api/src/enterprise'
import _ from 'lodash'
import moment from 'moment'

/**
 * 运营时间&日期选择器
 */

export interface ServiceDatePickerProps {
  service_period_id: string
  date: Date
  onChange: (v: string, d: Date) => void
  onInit?: (v: string, d: Date) => void
}

const defaultDate = moment().startOf('day').format('YYYY-MM-DD')

const ServiceDatePicker: FC<ServiceDatePickerProps> = ({
  service_period_id,
  date,
  onChange,
  onInit,
}) => {
  service_period_id = service_period_id || ''
  date = date || defaultDate

  const [select, setSelect] = useState({
    service_period_id,
    date,
  })

  const { data } = useAsync<any, MoreSelectDataItem<string>[]>(
    async () => {
      const res = await ListServicePeriod({
        paging: { offset: 0, limit: 999 },
      })

      return _.map(res.response.service_periods, (item) => {
        return {
          // @ts-ignore
          value: item.service_period_id,
          text: item.name || '',
          original: item,
        }
      })
    },
    {
      manual: false,
    },
  )

  useEffect(() => {
    const newSelect = {
      ...select,
      service_period_id: data?.[0]?.value ?? '',
    }
    setSelect(newSelect)
    onInit && onInit(newSelect.service_period_id, newSelect.date)
  }, [data])

  const handleChange = (v: string | Date | null) => {
    if (!v) return
    let newSelect
    if (_.isDate(v)) {
      newSelect = {
        ...select,
        date: v,
      }
    } else {
      newSelect = {
        ...select,
        service_period_id: v!,
      }
    }
    setSelect(newSelect)
    onChange(newSelect.service_period_id, newSelect.date)
  }

  const time = useMemo(() => {
    return _.find(data, (d) => d.value === select.service_period_id)
  }, [select.service_period_id, data])

  const handleRenderDate = (d: Date) => {
    if (time) {
      const service_time = time.original as ServicePeriod
      const begin = moment(d)
        .add(service_time.order_create_min_time)
        .format('MM月DD日 HH:mm')
      const end = moment(d)
        .add(service_time.order_create_max_time)
        .format('MM月DD日 HH:mm')
      return begin + '~' + end + '下单'
    }
    return '-'
  }

  return (
    <Flex flex>
      <Select
        className='gm-margin-right-5'
        value={select.service_period_id}
        data={data || []}
        onChange={handleChange}
      />
      <DatePicker
        style={{
          flex: 1,
        }}
        date={select.date}
        onChange={handleChange}
        renderDate={handleRenderDate}
      />
    </Flex>
  )
}

export default ServiceDatePicker
