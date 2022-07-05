import React, { FC } from 'react'
import { Flex, Price } from '@gm-pc/react'
import classNames from 'classnames'
import SquareCell from './square_cell'
import moment, { Moment } from 'moment'
import { t } from 'gm-i18n'
import { AnalyticsCustomerMealRecordResponse_Analytic } from 'gm_api/src/enterprise'

interface CardCellProps {
  item: AnalyticsCustomerMealRecordResponse_Analytic
  currentDate?: Moment
  type?: 'cost' | 'turnover'
  _onClick?: (date: Moment) => void
}

const CardCell: FC<CardCellProps> = ({
  item,
  currentDate,
  type = 'turnover',
  _onClick,
}) => {
  return (
    <Flex
      justifyStart
      alignCenter
      width='221px'
      height='100px'
      className={classNames('gm-border b-head-card gm-margin-left-15', {
        'b-head-card-select':
          currentDate &&
          +currentDate.month() + 1 === +moment(item.date).month() + 1,
        'gm-cursor': type === 'turnover',
      })}
      style={{
        borderRadius: 3,
      }}
      onClick={() => {
        _onClick && _onClick(moment(item.date))
      }}
    >
      <SquareCell
        timeItem={`${moment(item.date).year()}-`}
        textItem={`${moment(item.date).month() + 1}月`}
      />
      <Flex column justifyCenter alignStart className=' gm-margin-left-10'>
        <span className='gm-text-desc gm-margin-bottom-10'>
          {type === 'cost' ? t('月成本额（元）') : t('营业额（元）')}
        </span>
        <Price
          value={+item.total_price! || 0}
          currencyScale={0.8}
          precision={2}
          className='gm-text-bold'
          style={{
            fontSize: 18,
          }}
        />
      </Flex>
    </Flex>
  )
}

export default CardCell
