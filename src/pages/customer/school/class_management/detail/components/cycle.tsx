import React, { FC } from 'react'
import store from '../store'
import { observer, Observer } from 'mobx-react'
import { t } from 'gm-i18n'
import { Flex, DateRangePicker } from '@gm-pc/react'
import moment from 'moment'
import CycleItem from './cycle_item'
import { Cycle } from 'gm_api/src/eshop'
interface CycleProps {
  type: Cycle
  is_look?: boolean
}
// 根据传进来的时间来判断一下周还是月还是学期来根据store来判定
// 先算出每周
// 每月的天数
const CycleComponent: FC<CycleProps> = ({ type, is_look }) => {
  const { setServiceCycle } = store
  const handleChange = (begin: Date, end: Date) => {
    // 如果是按照学期来的话
    setServiceCycle('start', moment(begin).format('YYYY-MM-DD'))
    setServiceCycle('end', moment(end).format('YYYY-MM-DD'))
    setServiceCycle('start_time', moment(begin).format('HH:mm'))
    setServiceCycle('end_time', moment(end).format('HH:mm'))
  }

  if (type === Cycle.CYCLE_WEEKLY) {
    return (
      <Flex alignCenter>
        <Flex alignCenter>
          <div style={{ width: '600px' }}>
            <CycleItem type={type} is_look={is_look} />
            <span>{t('开启下周订餐')}</span>
          </div>
        </Flex>
        <div className='gm-text-desc' style={{ width: '400px' }}>
          {t('如：每周周三12：00至周三20：00开启下周订餐')}
        </div>
      </Flex>
    )
  }
  if (type === Cycle.CYCLE_MONTHLY) {
    return (
      <>
        <Flex alignCenter>
          <Flex alignCenter>
            <div style={{ width: '600px' }}>
              <CycleItem type={type} />
              <span>{t('开启下月订餐')}</span>
            </div>
          </Flex>
          <div className='gm-text-desc' style={{ width: '400px' }}>
            {t('如：每月27日12：00至每月28日20：00开启下月订餐')}
          </div>
        </Flex>
      </>
    )
  }
  return (
    <Observer>
      {() => {
        const { start, end, start_time, end_time } =
          store.serviceInfo.CycleTime[type]
        const beginTime = moment(start + ' ' + start_time).toDate()
        const endTime = moment(end + ' ' + end_time).toDate()
        return (
          <DateRangePicker
            disabled={is_look}
            onChange={(begin: Date, end: Date) => {
              if (begin && end) {
                handleChange(begin, end)
              }
            }}
            begin={beginTime}
            end={endTime}
            enabledTimeSelect
            style={{ width: '300px' }}
          />
        )
      }}
    </Observer>
  )
}

export default observer(CycleComponent)
