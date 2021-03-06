import { getLocale } from '@gm-pc/locales'
import React from 'react'
import _ from 'lodash'
import { Flex } from '@gm-pc/react'

const weekDays = [
  getLocale('week__日'),
  getLocale('week__一'),
  getLocale('week__二'),
  getLocale('week__三'),
  getLocale('week__四'),
  getLocale('week__五'),
  getLocale('week__六'),
]
const Week = () => {
  return (
    <Flex className='b-calendar-week gm-border-bottom'>
      {_.map(weekDays, (v, i) => (
        <Flex
          key={i}
          flex
          alignCenter
          justifyCenter
          className='gm-text-desc gm-text-bold gm-text-16'
        >
          {v}
        </Flex>
      ))}
    </Flex>
  )
}

export default Week
