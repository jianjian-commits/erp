import React, { FC } from 'react'
import { observer } from 'mobx-react'
import { t } from 'gm-i18n'
import styled from 'styled-components'
import _ from 'lodash'
import {
  getWeek2,
  toFixedOrder,
  getTimestamp,
  getFormatByTimestamp,
} from '@/common/util'
import { SummaryData } from '../interface'

import { Flex } from '@gm-pc/react'

interface Props {
  summary: { menu_time: string; total_price: number; data: SummaryData[] }
}

const SpanText = styled.span`
  font-size: 14px;
  margin: 10px;
  width: 30%;
  text-align: center;
`
const SpanPrice = styled.span`
  font-size: 14px;
  margin: 10px;
  width: 30%;
  text-align: end;
`

const SpanTitleText = styled(SpanText)`
  color: #7f7f7f;
`

const SpanTitlePrice = styled(SpanPrice)`
  color: #7f7f7f;
`

const DivideLine = styled.div`
  width: 90%;
  height: 1px;
  margin: auto;
  opacity: 0.5;
  border: 1px solid rgba(0, 0, 0, 0.14);
`

const MenuTimeInfo: FC<Props> = observer(
  ({ summary: { menu_time, total_price, data } }) => {
    const getTotalCount = (data: SummaryData[]): number => {
      const totalCount = _.reduce(
        _.map(data, (item) => item.count),
        (pre, cur) => {
          return pre + cur
        },
      )
      return totalCount || 0
    }

    return (
      <Flex column className='gm-bg-white tw-rounded-lg'>
        <Flex justifyBetween>
          <span className='gm-text-16 gm-margin-20'>
            {getWeek2(menu_time)}&nbsp;
            <span style={{ color: '#7f7f7f' }}>
              {`(${getFormatByTimestamp('MM.DD', getTimestamp(menu_time))})`}
            </span>
          </span>
        </Flex>
        <Flex justifyBetween className='gm-margin-lr-10'>
          <SpanTitleText style={{ textAlign: 'left' }}>
            {t('餐次')}
          </SpanTitleText>
          <SpanTitleText>{t('人数')}</SpanTitleText>
          <SpanTitleText style={{ textAlign: 'right' }}>
            {t('金额(元)')}
          </SpanTitleText>
        </Flex>
        <DivideLine />
        {data.map((item) => (
          <Flex justifyBetween key={item.name} className='gm-margin-lr-10'>
            <SpanText style={{ textAlign: 'left' }}>{t(item.name)}</SpanText>
            <SpanText>{item.count}</SpanText>
            <SpanPrice style={{ textAlign: 'right' }}>
              {toFixedOrder(item.price)}
            </SpanPrice>
          </Flex>
        ))}
        <DivideLine />
        <Flex justifyBetween className='gm-margin-lr-10'>
          <SpanTitleText style={{ textAlign: 'left' }}>
            {t('总计')}
          </SpanTitleText>
          <SpanText>{getTotalCount(data)}</SpanText>
          <SpanTitlePrice style={{ textAlign: 'right' }}>
            {toFixedOrder(total_price)}
          </SpanTitlePrice>
        </Flex>
      </Flex>
    )
  },
)

export default MenuTimeInfo
