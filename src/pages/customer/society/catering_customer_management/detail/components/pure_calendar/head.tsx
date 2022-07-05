import React, { FC, ReactNode, useState } from 'react'
import moment, { Moment } from 'moment'
import classNames from 'classnames'
import _ from 'lodash'
import { getLocale } from '@gm-pc/locales'

import { Flex } from '@gm-pc/react'
import SVGCalendarMonth from '@/svg/next.svg'
import type { DataItem } from './types'
import { AnalyticsCustomerMealRecordResponse_Analytic } from 'gm_api/src/enterprise'

const months = [
  getLocale('01月'),
  getLocale('02月'),
  getLocale('03月'),
  getLocale('04月'),
  getLocale('05月'),
  getLocale('06月'),
  getLocale('07月'),
  getLocale('08月'),
  getLocale('09月'),
  getLocale('10月'),
  getLocale('11月'),
  getLocale('12月'),
]
interface HeadProps {
  /* 当前日期 */
  value: Moment
  /** 切换月份 */
  onChange(value: Moment): void
  /** 可选月份数据 */
  rangeMonth: AnalyticsCustomerMealRecordResponse_Analytic[]
}

const Head: FC<HeadProps> = (props) => {
  const { value, onChange, rangeMonth } = props

  /** 获取可选月份范围 */
  const isMin = value.month() + 1 <= +moment(rangeMonth[0]?.date!).month() + 1
  const isMax =
    value.month() + 1 >=
    +moment(rangeMonth[rangeMonth.length - 1]?.date!).month() + 1

  // 用于记录当前展示最后一个可选年份与 year 的偏移值, 默认为0
  const handleChange = (diff: number): void => {
    onChange(moment(value).add(diff, 'month'))
  }

  return (
    <>
      <Flex
        alignCenter
        justifyCenter
        className='b-calendar-head gm-border-bottom'
      >
        <div>
          <span
            className={classNames('b-calendar-head-icon gm-cursor', {
              'b-calendar-head-icon-disable': isMin,
            })}
            onClick={isMin ? undefined : () => handleChange(-1)}
          >
            <SVGCalendarMonth
              className='b-calendar-head-year-icon'
              style={{
                transform: 'rotate(180deg)',
              }}
            />
          </span>
        </div>
        <Flex row justifyCenter width='200px'>
          <span className='b-calendar-head-text'>
            {value.year()}
            {getLocale('年')}
          </span>
          &nbsp;
          <span className='b-calendar-head-text'>{months[value.month()]}</span>
        </Flex>
        <div>
          <span
            className={classNames('b-calendar-head-icon gm-cursor', {
              'b-calendar-head-icon-disable': isMax,
            })}
            onClick={isMax ? undefined : () => handleChange(1)}
          >
            <SVGCalendarMonth className='b-calendar-head-year-icon' />
          </span>
        </div>
      </Flex>
    </>
  )
}

export default Head
