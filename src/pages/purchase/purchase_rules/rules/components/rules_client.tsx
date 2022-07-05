import React from 'react'
import ClientTable from './client/client_table'
import ClientLeft from './client/client_left'
import ClientRightFilter from './client/client_right_filter'
import { Flex } from '@gm-pc/react'
import store from '../store'
const RulesClient = () => {
  return (
    <Flex className='rules-list'>
      {/* 左右结构 */}
      <Flex className='rules-list-item'>
        {/* 左 */}
        <div className='rules-list-left-box'>
          <ClientLeft />
        </div>
        {/* 右 */}
        <div className='rules-list-right-box'>
          <ClientRightFilter />
          <ClientTable />
        </div>
      </Flex>
    </Flex>
  )
}
export default RulesClient
