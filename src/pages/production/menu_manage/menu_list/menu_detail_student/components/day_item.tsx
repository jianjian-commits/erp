import React, { FC } from 'react'
import { observer } from 'mobx-react'
import store from '../store'
import { Flex, Checkbox } from '@gm-pc/react'
import MenuItem from './menu_item'
import { getWeek } from '@/common/util'
import _ from 'lodash'
import classNames from 'classnames'

interface DayItemProps {
  dayIndex: number
}

const DayItem: FC<DayItemProps> = observer(({ dayIndex }) => {
  const {
    menu_time,
    isHoliday,
    holidayName,
    periodInfos,
    state,
    selected,
    disabled,
  } = store.menuList[dayIndex]

  const renderDay = () => {
    return _.map(periodInfos, (_, mealIndex: number) => {
      return <MenuItem dayIndex={dayIndex} mealIndex={mealIndex} />
    })
  }

  return (
    <Flex
      none
      className={classNames('b-day-item', `b-day-item-status-${state}`, {
        'b-day-item-selected': selected,
      })}
      key={Math.random()}
      style={{ minHeight: '380px', minWidth: '260px' }}
    >
      <Flex column flex className='gm-position-relative'>
        <div className='gm-border-bottom'>
          <Flex className='b-day-item-head' alignCenter>
            <Checkbox
              className='gm-margin-top-10'
              onChange={() => store.setDateChecked(dayIndex)}
              checked={store.checkDateArr[dayIndex]}
              disabled={disabled}
            />
            <Flex column flex>
              <div className='gm-text-center gm-text-18'>
                {getWeek(menu_time)}
                {isHoliday && (
                  <span style={{ color: 'red' }}>（{holidayName}）</span>
                )}
              </div>
              <div className='gm-text-center'>
                <span>{menu_time}</span>
              </div>
            </Flex>
          </Flex>
        </div>
        <div style={{ height: '100%' }}>{renderDay()}</div>
      </Flex>
    </Flex>
  )
})

export default DayItem
