import React, { FC, MouseEvent } from 'react'
import classNames from 'classnames'
import { Moment } from 'moment'
import { Flex, Price, Popover } from '@gm-pc/react'
import { t } from 'gm-i18n'
import { CustomerMealRecord } from 'gm_api/src/enterprise'
import Big from 'big.js'
import _ from 'lodash'
import { observer } from 'mobx-react'

interface DayProps {
  /* 日期值 */
  value: Moment
  /* 键盘用 */
  will: Moment
  current: Moment
  Mealdata: CustomerMealRecord

  _onClick: (value: Moment) => void
}

const Day: FC<DayProps> = ({ value, will, Mealdata, current, _onClick }) => {
  const handleMouseOver = (event: MouseEvent<HTMLSpanElement>): void => {
    // 获取鼠标所在hover值
  }

  const isCurrentMonth = value.month() === will.month()
  const isCurrentDate = current.date() === value.date()

  const cn = classNames('b-calendar-day gm-cursor', {
    // 无状态
    'b-calendar-day-old': will.month() > value.month(),
    'b-calendar-day-new': will.month() < value.month(),
    'gm-border': isCurrentMonth,
    'gm-text-primary ': isCurrentDate,
    'b-current-date': isCurrentMonth && isCurrentDate,
  })

  const price_cn = classNames('gm-text-primary gm-text-bold', {
    'gm-text-desc': !isCurrentDate,
    // 'b-date-price': isCurrentDate,
  })

  const customerMealRecord = Mealdata

  /** 餐次展示 */
  let totalNumber = 0
  const renderPopup = () => {
    return (
      <div
        style={{
          width: '270px',
          height: 'auto',
          background: '#F7FBFE',
          boxShadow: '4px 4px 8px 0px #EAEBEC',
          border: '1px solid #56a3f2',
          borderRadius: 5,
        }}
        className='gm-padding-5'
      >
        {customerMealRecord?.record_detail?.details?.length &&
          _.map(customerMealRecord.record_detail.details, (it, index) => {
            totalNumber = totalNumber + +it.people_num!
            return (
              <Flex
                key={index}
                justifyBetween
                alignCenter
                height='40px'
                className='gm-padding-left-10 gm-padding-right-10'
              >
                <Flex justifyStart alignCenter>
                  <div
                    className='gm-margin-right-5'
                    style={{
                      width: '5px',
                      height: '5px',
                      background: '#212121',
                      borderRadius: '50%',
                    }}
                  />
                  <span>{it.name || '-'}</span>
                </Flex>
                <Flex justifyStart alignCenter>
                  <span className='gm-text-primary gm-text-bold'>{`${
                    it.people_num || '-'
                  }`}</span>
                  <span className='gm-text-desc'>{t('人')}</span>
                </Flex>
                <Flex justifyStart alignCenter>
                  <span className='gm-text-primary gm-text-bold'>{`${
                    Big(+it.price! || 0).toFixed(2) || '-'
                  }`}</span>
                  <span className='gm-text-desc'>{t('元')}</span>
                </Flex>
              </Flex>
            )
          })}
        <Flex
          className='gm-border-top gm-padding-left-10 gm-padding-right-10'
          justifyBetween
          alignCenter
          height='40px'
        >
          <Flex
            justifyStart
            alignCenter
            style={{
              marginLeft: 3,
            }}
          >
            <div
              className='gm-margin-right-5'
              style={{
                width: 2,
                height: 10,
                background: '#212121',
                borderRadius: 5,
              }}
            />
            <span>{t('合计')}</span>
          </Flex>
          <Flex justifyStart alignCenter>
            <span className='gm-text-primary gm-text-bold'>{`${
              totalNumber || '-'
            }`}</span>
            <span className='gm-text-desc'>{t('人')}</span>
          </Flex>
          <Flex justifyStart alignCenter>
            <span className='gm-text-primary gm-text-bold'>{`${
              Big(+customerMealRecord.price).toFixed(2) || '-'
            }`}</span>
            <span className='gm-text-desc'>{t('元')}</span>
          </Flex>
        </Flex>
      </div>
    )
  }

  const renderDate = () => {
    return (
      <Flex
        column
        justifyCenter
        alignCenter
        className={cn}
        onMouseOver={handleMouseOver}
        onClick={() => {
          if (!isCurrentMonth) {
            return
          }
          _onClick(value)
        }}
        width='92px'
        height='65px'
        style={{
          marginLeft: 5,
          marginTop: 5,
          borderRadius: 3,
        }}
      >
        {isCurrentMonth ? (
          <>
            <span className='gm-text-bold gm-text-16'>
              {value.date() < 10 ? `0${value.date()}` : value.date()}
            </span>
            {customerMealRecord ? (
              <Price
                value={+customerMealRecord.price || 0}
                currencyScale={0.8}
                className={price_cn}
              />
            ) : (
              '-'
            )}
          </>
        ) : (
          ''
        )}
      </Flex>
    )
  }

  return customerMealRecord && isCurrentMonth ? (
    <Popover type='focus' right showArrow popup={renderPopup()}>
      {renderDate()}
    </Popover>
  ) : (
    renderDate()
  )
}

export default observer(Day)
