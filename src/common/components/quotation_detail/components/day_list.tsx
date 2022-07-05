import React from 'react'
import { observer } from 'mobx-react'
import DayItem from './day_item'
import { Flex, Checkbox } from '@gm-pc/react'
import _ from 'lodash'
import store from '../store'

const DayList: React.VFC = observer(() => {
  const { menuDetailList, menuPeriodGroups, selectedAll } = store

  const handleCheck = () => {
    store.changeSelectedAll()
  }

  return (
    <Flex className='gm-position-relative'>
      <div className='gm-border-bottom gm-border-right tw-flex-none'>
        {/* 左上角的全选按钮 */}
        <Flex alignCenter justifyCenter style={{ height: '59px' }}>
          <div style={{ marginTop: '10px' }}>
            <Checkbox onChange={handleCheck} checked={selectedAll} />
          </div>
        </Flex>
        <div className='gm-back-bg gm-padding-top-5'>
          {/* 生成最左侧的餐次 */}
          {_.map(menuPeriodGroups.slice(), (item, index) => {
            return (
              <Flex
                key={index}
                alignCenter
                style={{ height: `${store.getMinHeight(item.name) + 50}px` }}
                className='gm-border-bottom'
              >
                {item.name}
              </Flex>
            )
          })}
        </div>
      </div>
      <Flex className='gm-overflow-y'>
        {_.map(menuDetailList.slice(), (item, index) => {
          return <DayItem dayIndex={index} />
        })}
      </Flex>
    </Flex>
  )
})

DayList.displayName = 'DayList'

export default DayList
