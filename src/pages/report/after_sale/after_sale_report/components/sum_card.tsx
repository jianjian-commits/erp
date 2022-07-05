import { t } from 'gm-i18n'
import React, { CSSProperties } from 'react'
import { observer } from 'mobx-react'
import _ from 'lodash'
import { Flex, Box, Price } from '@gm-pc/react'
import store from '../store'
import HeaderTip from '@/common/components/header_tip'

import CommonVerticalLayout from '@/pages/sorting/components/common_vertical_layout'

const SumCard = observer(() => {
  const { summary } = store
  const style: CSSProperties = {
    background: '#FFFFFF',
    width: '100%',
  }
  const sortDataList = [
    {
      name: t('售后订单数'),
      value: summary.order_num,
      color: '#fa5151',
      numberClassName: 'b-full-screen-gradient-color-blue',
    },
    {
      name: (
        <HeaderTip
          header={t('售后商品数')}
          tip={t('发生过售后操作的商品种类数')}
        />
      ),
      value: summary.sku_num,
      color: '#fa5151',
      numberClassName: 'b-full-screen-gradient-color-blue',
    },
    {
      name: t('应退金额/实退金额'),
      // value: `¥${Big(summary.should_refund_amount).toFixed(2)} / ¥${Big(
      //   summary.real_refund_amount,
      // ).toFixed(2)}`,
      value: (
        <>
          <Price
            className='gm-margin-right-5'
            value={summary.should_refund_amount}
            style={{ fontSize: '32px' }}
          />
          /
          <Price
            className='gm-margin-left-5'
            value={summary.real_refund_amount}
            style={{ fontSize: '32px' }}
          />
        </>
      ),
      color: '#fa5151',
      numberClassName: 'b-full-screen-gradient-color-blue',
    },
  ]
  return (
    <Box style={style}>
      <Flex style={{ height: '130px' }}>
        {_.map(sortDataList, (item, i) => (
          <CommonVerticalLayout
            name={item.name}
            value={item.value}
            color={item.color}
            key={i}
            numberClassName={null}
          />
        ))}
      </Flex>
    </Box>
  )
})

export default SumCard
