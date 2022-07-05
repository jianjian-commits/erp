import React, { useState, FC } from 'react'
import moment, { Moment } from 'moment'
import classNames from 'classnames'
import Week from './week'
import Head from './head'
import Day from './day'
import { Flex } from '@gm-pc/react'
import _ from 'lodash'
import { observer } from 'mobx-react'
import { RangeCalendarProps } from './types'
import './style.less'
import CardCell from '../order_rule_cell/card_cell'

/**
|--------------------------------------------------
|  @components
| #下单限制相关组件，德保定制需求
|  包括：营业额纯数据展示
|--------------------------------------------------
*/

const RangeCalendar: FC<RangeCalendarProps> = (props) => {
  const { data, customerMealRecordListMap, className, fetchData } = props

  const [date, setDate] = useState(moment())
  const [current, setCurrent] = useState<Moment>(moment())

  /** 切换月份 */
  const handleChangeHead = (m: Moment): void => {
    setDate(m)
    // 获取当月数据
    fetchData(m)
  }

  /** 天的展示 */
  const day = moment(date).startOf('month').day(0).add(-1, 'day')

  const group = _.groupBy(_.range(42), (v) => parseInt(`${v / 7}`))

  return (
    <>
      <Flex
        alignCenter
        justifyStart
        width='100%'
        height='100px'
        className='gm-margin-top-10'
        style={{
          // 避免出现超过3个月份破坏布局的情况
          overflowX: 'scroll',
          whiteSpace: 'nowrap',
        }}
      >
        {_.map(data, (item, index) => {
          return (
            <CardCell
              key={`${index}-${item.date}`}
              item={item}
              currentDate={date}
              _onClick={(date: Moment) => {
                handleChangeHead(date)
              }}
            />
          )
        })}
      </Flex>

      <div
        className={classNames(
          'b-calendar gm-margin-15 gm-border gm-margin-top-5',
          className,
        )}
        style={{ width: '95%' }}
      >
        <Head value={date} onChange={handleChangeHead} rangeMonth={data} />
        <Week />
        <Flex
          column
          className='b-calendar-content gm-padding-bottom-10 gm-padding-top-10'
          style={{ width: '100%' }}
        >
          {_.map(group, (v, i) => (
            <Flex
              justifyStart
              alignCenter
              key={i}
              className='b-calendar-content-div'
            >
              {_.map(v, (_, index) => {
                const mm = moment(day.add(1, 'day'))
                return (
                  <Day
                    key={index}
                    value={mm}
                    will={date}
                    Mealdata={
                      customerMealRecordListMap[moment(mm).format('YYYYMMDD')]
                    }
                    current={current}
                    _onClick={(value) => {
                      setCurrent(value)
                    }}
                  />
                )
              })}
            </Flex>
          ))}
        </Flex>
      </div>
    </>
  )
}

export default observer(RangeCalendar)
