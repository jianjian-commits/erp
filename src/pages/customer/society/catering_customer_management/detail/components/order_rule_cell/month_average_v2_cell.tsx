import React, { FC } from 'react'
import { Price, Flex, Progress } from '@gm-pc/react'
import { t } from 'gm-i18n'
import { observer } from 'mobx-react'
import _ from 'lodash'
import Big from 'big.js'
import SquareCell from './square_cell'

interface MonthAverageV2CellProps {
  title: string
  average: number
  desc: string
}
const MonthAverageV2Cell: FC<MonthAverageV2CellProps> = ({
  title,
  average,
  desc,
}) => {
  return (
    <Flex
      column
      className='gm-margin-left-15 gm-margin-right-20 gm-margin-top-10'
    >
      <Flex justifyStart alignCenter>
        <div
          className='gm-bg-primary'
          style={{
            width: 4,
            height: 14,
            borderRadius: 2,
            marginBottom: 3,
          }}
        />
        <div className='gm-text-16 gm-margin-left-10'>{title || '-'}</div>
      </Flex>
      <Flex
        justifyStart
        alignCenter
        className='gm-border gm-margin-top-10 '
        style={{ borderRadius: 2, height: 100 }}
      >
        <SquareCell timeItem={t('近三月')} textItem={t('月均')} />
        <Flex column className='gm-margin-left-20'>
          <span className='gm-text-desc gm-margin-bottom-10'>
            {desc || '-'}
          </span>
          <Price
            value={+average || 0}
            currencyScale={0.8}
            precision={2}
            className='gm-text-bold'
            style={{
              fontSize: 18,
            }}
          />
        </Flex>
      </Flex>
    </Flex>
  )
}

export default MonthAverageV2Cell
