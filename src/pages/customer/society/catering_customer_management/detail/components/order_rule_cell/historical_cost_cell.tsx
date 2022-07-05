import React, { FC } from 'react'
import { Flex, Progress } from '@gm-pc/react'
import _ from 'lodash'
import { t } from 'gm-i18n'
import CardCell from './card_cell'

interface DateOption {
  date?: string
  total_price?: number
  percent: number
}
interface HistoricalCostCellProps {
  data: DateOption[]
}
const HistoricalCostCell: FC<HistoricalCostCellProps> = ({ data }) => {
  return (
    <>
      <Flex
        justifyStart
        alignCenter
        className='gm-margin-left-15 gm-margin-top-20'
      >
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
          {t(
            '占营业额比重由每月的实际下单金额与项目点填写的预估营业额计算所得',
          )}
        </div>
      </Flex>
      {data.length ? (
        <Flex
          alignCenter
          justifyStart
          width='100%'
          className='gm-margin-top-10 gm-margin-bottom-20'
          style={{
            // 避免出现超过3个月份破坏布局的情况
            overflowX: 'scroll',
            whiteSpace: 'nowrap',
          }}
        >
          {_.map([...data], (item, index) => {
            return (
              <Flex column key={index}>
                <CardCell item={item} type='cost' />
                <Flex
                  column
                  justifyCenter
                  className='gm-margin-left-15 gm-border-bottom gm-border-left gm-border-right'
                  width='221px'
                  height='100px'
                  style={{
                    borderRadius: 3,
                  }}
                >
                  <span className='gm-text-desc gm-margin-bottom-10 gm-margin-left-10'>
                    {t('占营业额比重（百分比）')}
                  </span>
                  <span className='gm-text-bold gm-margin-bottom-10 gm-text-18 gm-margin-left-10'>{`${item.percent}%`}</span>
                  <Progress
                    percentage={+item.percent}
                    disabledText
                    className='gm-margin-left-10 gm-margin-right-10'
                  />
                </Flex>
              </Flex>
            )
          })}
        </Flex>
      ) : (
        <Flex
          justifyCenter
          alignCenter
          height='100px'
          className='gm-border gm-margin-top-15 gm-margin-left-15 gm-margin-right-20'
        >
          {t('暂无历史数据')}
        </Flex>
      )}
    </>
  )
}

export default HistoricalCostCell
