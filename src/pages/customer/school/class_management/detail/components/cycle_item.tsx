import React, { useState, FC, useEffect } from 'react'
import { TimePicker, Select } from 'antd'
import { t } from 'gm-i18n'
import moment, { Moment } from 'moment'
import _ from 'lodash'
import { Cycle } from 'gm_api/src/eshop'
import store from '../store'
import { observer } from 'mobx-react'
const { Option } = Select
interface CyCleItemProps {
  type: Cycle
  is_look?: boolean
}
/**
 * @description 按照month和week来的
 */
const CycleItem: FC<CyCleItemProps> = ({ type, is_look }) => {
  const { CycleTime } = store.serviceInfo
  const { start, end, start_time, end_time } = CycleTime[type]
  const { setServiceCycle } = store
  const [option, setOption] = useState<{ text: number; value: number }[]>([])
  useEffect(() => {
    if (type === Cycle.CYCLE_WEEKLY) {
      const data = new Array(7).fill('').map((__, index) => {
        return {
          text: index + 1,
          value: index + 1,
        }
      })
      setOption(data)
    }
    if (type === Cycle.CYCLE_MONTHLY) {
      const num = +moment().startOf('month').add('month', 1).daysInMonth()
      const data = new Array(num).fill('').map((__, index) => {
        return {
          text: index + 1,
          value: index + 1,
        }
      })
      setOption(data)
    }
  }, [type])
  if (type === Cycle.CYCLE_WEEKLY) {
    return (
      <>
        <span>{t('每周')}</span>
        <Select
          disabled={is_look}
          style={{ width: '100px', margin: '0 5px' }}
          value={start}
          onChange={(value) => setServiceCycle('start', value)}
        >
          {_.map(option, (item) => (
            <Option value={item.value}>{item.text}</Option>
          ))}
        </Select>
        <TimePicker
          disabled={is_look}
          style={{ width: '100px', marginRight: '5px' }}
          onChange={(value, dateString) =>
            setServiceCycle('start_time', dateString)
          }
          value={start_time ? moment(start_time, 'HH:mm') : null}
          format='HH:mm'
        />
        <span>{t('至')}</span>
        <Select
          value={end}
          disabled={start === '' || is_look}
          style={{ width: '100px', margin: '0 5px' }}
          onChange={(value) => setServiceCycle('end', value)}
        >
          {_.map(option, (item, index) => (
            <Option disabled={+item.value < +start} value={item.value}>
              {item.text}
            </Option>
          ))}
        </Select>
        <TimePicker
          disabled={is_look}
          style={{ width: '100px', marginRight: '5px' }}
          onChange={(value, dateString) =>
            setServiceCycle('end_time', dateString)
          }
          value={end_time ? moment(end_time, 'HH:mm') : null}
          format='HH:mm'
        />
      </>
    )
  }
  return (
    <>
      <span>{t('每月')}</span>
      <Select
        disabled={is_look}
        options={option}
        style={{ width: '100px', margin: '0 5px' }}
        value={start}
        onChange={(value) => setServiceCycle('start', value)}
      >
        {_.map(option, (item) => (
          <Option value={item.value}>{item.text}</Option>
        ))}
      </Select>
      <TimePicker
        disabled={is_look}
        style={{ width: '100px', marginRight: '5px' }}
        onChange={(value, dateString) =>
          setServiceCycle('start_time', dateString)
        }
        value={start_time ? moment(start_time, 'HH:mm') : null}
        format='HH:mm'
      />
      <span>{t('至')}</span>
      <Select
        options={option}
        style={{ width: '100px', margin: '0 5px' }}
        disabled={start === '' || is_look}
        value={end}
        onChange={(value) => setServiceCycle('end', value)}
      >
        {_.map(option, (item) => (
          <Option disabled={+item.value < +start} value={item.value}>
            {item.text}
          </Option>
        ))}
      </Select>
      <TimePicker
        disabled={is_look}
        style={{ width: '100px', marginRight: '5px' }}
        onChange={(value, dateString) =>
          setServiceCycle('end_time', dateString)
        }
        value={end_time ? moment(end_time, 'HH:mm') : null}
        format='HH:mm'
      />
    </>
  )
}
export default observer(CycleItem)
