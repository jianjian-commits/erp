import React, { FC } from 'react'
import { observer } from 'mobx-react'
import moment, { Moment } from 'moment'
import _ from 'lodash'
import { Flex } from '@gm-pc/react'
import { InputNumber } from 'antd'

import Day from './day'
import store from '../../store'
import { t } from 'gm-i18n'
import classNames from 'classnames'

interface ContentProps {
  /** 开始日期 */
  begin: Moment | null
  /**  结束日期 */
  end: Moment | null
  /** 选中日期 */
  onSelect(date: Moment): void
  /** 键盘用 */
  will: Moment
  /** 最小可选日期 */
  min?: Date
  /** 最大可选日期 */
  max?: Date
  /** 自定义可选日期 */
  disabledDate?(
    date: Date,
    options: { begin?: Date | null; end?: Date | null },
  ): boolean
  /** 当前鼠标hover日期 */
  hoverDay?: Moment | null
  /** 鼠标hover日期修改函数 */
  onHoverDay?(date: Moment | null): void
}

const Content: FC<ContentProps> = observer((props) => {
  const { begin, end, onSelect, will } = props
  const { defaultMealCount, changeMealCount, meal_calendars, curDate } = store

  const day = moment(will).startOf('month').day(0).add(-1, 'day')

  const group = _.groupBy(_.range(42), (v) => parseInt(`${v / 7}`))

  const isDisabledDay = (m: Moment): boolean => {
    const { disabledDate } = props
    let min: Moment | null = null
    if (props.min) {
      min = moment(props.min).startOf('day')
    }
    let max: Moment | null = null
    if (props.max) {
      max = moment(props.max).startOf('day')
    }
    let disabled = false
    if (disabledDate) {
      disabled = disabledDate(m.toDate(), {
        begin: begin && begin.toDate(),
        end: end && end.toDate(),
      })
    } else {
      if (min && m < min) {
        disabled = true
      }
      if (max && m > max) {
        disabled = true
      }
    }
    return disabled
  }

  const getMealCount = (
    date: moment.Moment,
    editVal: string | undefined,
    defaultCount: number,
  ) => {
    const isCurMonth = date.month() === curDate.month()

    if (isCurMonth) {
      if (editVal === undefined) {
        if ([0, 6].includes(date.day())) return 0
        return defaultCount
      } else {
        return editVal
      }
    } else {
      return null
    }
  }

  return (
    <div className='gm-calendar-content'>
      {_.map(group, (v, i) => (
        <div key={i} className='gm-calendar-content-div'>
          <Flex>
            <Flex flex column alignCenter justifyCenter>
              <Flex
                style={{ height: 30, width: '100%' }}
                alignCenter
                justifyCenter
              />
              {_.map(defaultMealCount, (item) => (
                <Flex
                  key={item.id}
                  style={{ height: 30, width: '100%' }}
                  alignCenter
                  justifyCenter
                  className='gm-bg-white '
                >
                  {t(item.name)}
                </Flex>
              ))}
            </Flex>
            {_.map(v, (_, index) => {
              const mm = moment(day.add(1, 'day'))
              // 只展示当前月份的就餐人数
              const isCurMonth = mm.month() === curDate.month()

              return (
                <Flex key={index} column flex alignCenter justifyCenter>
                  <Day
                    value={mm}
                    begin={begin}
                    end={end}
                    disabled={isDisabledDay(mm)}
                    onClick={onSelect}
                    will={will}
                  />
                  {defaultMealCount.map((item) => {
                    const editVal = meal_calendars.find(
                      (item) => item?.meal_time === `${mm.valueOf()}`,
                    )?.meal_calendar_datas?.meal_calendar_datas?.[item.id]

                    const value = getMealCount(mm, editVal, item.count)
                    const diffStyle = () => {
                      let boo = false
                      if ([0, 6].includes(mm.day())) {
                        if (+value !== 0) boo = true
                      } else {
                        if (value && +value !== item.count) boo = true
                      }
                      return { 'gm-input-calendar-diff': boo }
                    }
                    return (
                      <Flex
                        key={item.id}
                        style={{ height: 30, width: '100%' }}
                        alignCenter
                        justifyCenter
                      >
                        <InputNumber
                          className={classNames(diffStyle())}
                          min={0}
                          precision={0}
                          max={9999}
                          formatter={(value) => {
                            return value ? `${value} 人` : ''
                          }}
                          value={value}
                          disabled={!isCurMonth || mm.isSameOrBefore(moment())}
                          onChange={(value) => {
                            changeMealCount({ [item.id]: value }, mm)
                          }}
                        />
                      </Flex>
                    )
                  })}
                </Flex>
              )
            })}
          </Flex>
        </div>
      ))}
    </div>
  )
})

export default Content
