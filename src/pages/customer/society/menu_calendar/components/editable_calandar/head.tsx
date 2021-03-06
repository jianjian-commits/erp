import React, { FC, ReactNode, useState } from 'react'
import moment, { Moment } from 'moment'
import classNames from 'classnames'
import _ from 'lodash'
import { getLocale } from '@gm-pc/locales'

import { Flex } from '@gm-pc/react'
import SVGCalendarYear from './svg/calendar-year.svg'
import SVGCalendarMonth from './svg/calendar-month.svg'
import { DisabledYearAndMonth } from './types'

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
  onChange(value: Moment): void
  /* 禁用 年 / 月 切换按钮 */
  disabledYearAndMonth: DisabledYearAndMonth
}

type SelectType = 'year' | 'month'

const Head: FC<HeadProps> = (props) => {
  const { value, onChange, disabledYearAndMonth } = props
  // 以十年为一个年份选择周期, year 为所在周期最后一个可选年份
  const year = moment().year()

  // 月份选择 -- 'month' / 年份选择 -- 'year'
  const [selectType, setSelectType] = useState<SelectType | null>(null)
  // 用于记录当前展示最后一个可选年份与 year 的偏移值, 默认为0
  const [yearEndOffset, setYearEndOffset] = useState(0)

  const handleChange = (diff: number, type: SelectType): void => {
    onChange(moment(value).add(diff, type))

    // 年月选择需关闭展示
    if (selectType) {
      setSelectType(null)
    }
  }

  const handleSelectTypeChange = (type: SelectType): void => {
    if (type === 'year') {
      // 判断当前展示的年份在哪一段范围内
      const diff = value.year() - year
      let index = Math.abs(diff) / 10
      let range = null

      if (diff > 0) {
        // 往后
        index = Math.ceil(index)
        range = 10
      } else {
        // 往前
        index = Math.floor(index)
        range = -10
      }
      const e = index * range
      setYearEndOffset(e)
    }
    setSelectType(type)
  }

  const handleYearChange = (index: number | undefined, diff: number) => {
    // 非年月选择 正常处理
    if (!selectType) {
      handleChange(diff, 'year')
      return
    }

    // 月份选择时改变年份，不关闭展示面板
    if (selectType === 'month') {
      onChange(moment(value).add(diff, 'year'))
      return
    }

    // 年份点击切换 以及 展示的年份第一个和最后一个点击交互为--展示前 or 后一轮的年份展示, 不直接改变日期
    if (index === 0 || index === 9) {
      const range = index === 0 ? -8 : 8
      const e = yearEndOffset + range
      setYearEndOffset(e)
      return
    }

    handleChange(diff, 'year')
  }

  const renderYearSelection = (): ReactNode => {
    // 拿到展示选择的年份范围
    let b = yearEndOffset - 9
    const years = []
    while (b <= yearEndOffset) {
      years.push(year + b)
      b++
    }

    return (
      <Flex justifyCenter className='gm-calendar-years-or-months'>
        {_.map(years, (year, index) => (
          <span
            key={index}
            className={classNames('gm-calendar-year-or-month', {
              active: year === value.year() && index !== 0 && index !== 11,
              'gm-calendar-year-or-month-change': index === 0 || index === 11,
            })}
            onClick={() =>
              handleYearChange(
                [0, 9].includes(index) ? undefined : index,
                year - value.year(),
              )
            }
          >
            {year}
          </span>
        ))}
      </Flex>
    )
  }

  const renderMonthSelection = (): ReactNode => {
    return (
      <Flex justifyCenter className='gm-calendar-years-or-months'>
        {_.map(_.range(12), (i) => (
          <span
            key={i}
            className={classNames('gm-calendar-year-or-month', {
              active: i === value.month(),
            })}
            onClick={() => handleChange(i - value.month(), 'month')}
          >
            {months[i]}
          </span>
        ))}
      </Flex>
    )
  }

  const renderYear = (): ReactNode => {
    // 处于年份选择，展示年份选择范围
    if (selectType === 'year') {
      const b = year + yearEndOffset - 9
      const e = year + yearEndOffset
      return (
        <span className='gm-calendar-head-text'>
          {b} ~ {e}
        </span>
      )
    }

    // 正常展示年份
    return (
      <span
        className='gm-calendar-head-text'
        onClick={() => handleSelectTypeChange('year')}
      >
        {value.year()}
        {getLocale('年')}
      </span>
    )
  }

  const renderMonth = (): ReactNode => {
    // 年月选择不需要展示月份
    return (
      !selectType && (
        <span
          className='gm-calendar-head-text'
          onClick={() => handleSelectTypeChange('month')}
        >
          {months[value.month()]}
        </span>
      )
    )
  }

  return (
    <>
      <Flex
        alignCenter
        justifyCenter
        className='gm-calendar-head gm-border-bottom'
      >
        <div>
          <span
            className={classNames('gm-calendar-head-icon', {
              'gm-hidden':
                disabledYearAndMonth === 'left' && selectType !== 'year',
            })}
            onClick={() => handleYearChange(0, -1)}
          >
            <SVGCalendarYear className='gm-calendar-head-year-icon' />
          </span>
          <span
            className={classNames('gm-calendar-head-icon', {
              'gm-hidden': disabledYearAndMonth === 'left' || selectType,
            })}
            onClick={() => handleChange(-1, 'month')}
          >
            <SVGCalendarMonth className='gm-calendar-head-year-icon' />
          </span>
        </div>
        <Flex row justifyCenter>
          {renderYear()}
          &nbsp;
          {renderMonth()}
        </Flex>
        <div>
          {disabledYearAndMonth !== 'right' && (
            <span
              className={classNames('gm-calendar-head-icon', {
                'gm-hidden': selectType,
              })}
              onClick={() => handleChange(1, 'month')}
            >
              <SVGCalendarMonth
                className='gm-calendar-head-year-icon'
                style={{ transform: 'rotate(180deg)' }}
              />
            </span>
          )}
          <span
            className={classNames('gm-calendar-head-icon', {
              'gm-hidden':
                disabledYearAndMonth === 'right' && selectType !== 'year',
            })}
            onClick={() => handleYearChange(9, 1)}
          >
            <SVGCalendarYear
              className='gm-calendar-head-year-icon'
              style={{ transform: 'rotate(180deg)' }}
            />
          </span>
        </div>
      </Flex>
      {selectType === 'month' && renderMonthSelection()}
      {selectType === 'year' && renderYearSelection()}
    </>
  )
}

export default Head
