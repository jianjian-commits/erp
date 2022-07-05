import React, { FC } from 'react'
import { Price, Flex, Progress } from '@gm-pc/react'
import { t } from 'gm-i18n'
import { observer } from 'mobx-react'
import _ from 'lodash'
import Big from 'big.js'

/** type */
interface DataProps {
  cost: string
  pre: string
  time: string
}
interface MonthAverageCellProps {
  data: DataProps[]
}
// 暂时没用到
const MonthAverageCell: FC<MonthAverageCellProps> = observer(
  ({ data = [] }) => {
    let monthlyCost = 0
    if (data.length) {
      _.forEach(data, (item) => {
        monthlyCost = monthlyCost + +item.cost
      })
    }

    const _percentage_ = Big(monthlyCost)
      .div(data.length)
      .div(monthlyCost)
      .times(100)
      .toFixed(0)
    return (
      <Flex column className='gm-margin-left-15 gm-margin-right-20'>
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
          <div className='gm-text-16 gm-margin-left-10'>
            {t('月均营业额（近三月）')}
          </div>
        </Flex>
        <Flex
          column
          justifyCenter
          className='gm-border gm-margin-top-10 gm-padding-10'
          style={{ borderRadius: 2, height: 100 }}
        >
          <Price
            value={+Big(monthlyCost).div(data.length).toFixed(2)}
            currencyScale={0.8}
            precision={2}
            className='gm-text-bold gm-margin-bottom-5'
            style={{
              fontFamily: 'PingFangSC-Semibold, PingFang SC',
              fontSize: 22,
            }}
          />
          <div
            className='gm-margin-bottom-10'
            style={{
              height: 20,
              width: `${_percentage_}%`,
              position: 'relative',
              borderTop: '2px solid #56a3f2',
              borderRadius: 1,
            }}
          >
            <div
              style={{
                display: 'inline-block',
                position: 'absolute',
                width: 26,
                height: 26,
                borderLeft: '2px solid #56a3f2',
                transform: 'rotate(-15deg)',
                transformOrigin: 'left top',
                right: 0,
                marginRight: -10,
                zIndex: 10,
                background: 'white',
                borderRadius: 1,
                marginTop: -2,
              }}
            />
          </div>

          <div style={{ width: '100%' }}>
            <Progress percentage={+_percentage_} disabledText />
          </div>
        </Flex>
      </Flex>
    )
  },
)

export default MonthAverageCell
