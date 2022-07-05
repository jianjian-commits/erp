import React from 'react'
import { Flex } from '@gm-pc/react'
import MerchandiseLeft from './merchandise/merchandise_left'
import MerchandiseRightTabs from './merchandise/merchandise_right_tabs'
import MerchandiseHeader from './merchandise/merchandise_header'
import { t } from 'gm-i18n'
import store from '../store'
const RulesMerchandise = () => {
  return (
    <Flex className='rules-list'>
      {/* 左右结构 */}
      <Flex className='rules-list-item'>
        {/* 左 */}
        <div className='rules-list-left-box'>
          <MerchandiseLeft />
        </div>
        {/* 右 */}
        <div className='rules-list-right-box'>
          {/* header */}
          <MerchandiseHeader />
          {/* tables */}
          <MerchandiseRightTabs />
        </div>
      </Flex>
    </Flex>
  )
}
export default RulesMerchandise
