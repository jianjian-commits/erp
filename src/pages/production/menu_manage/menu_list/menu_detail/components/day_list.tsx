import React from 'react'
import { observer } from 'mobx-react'
import DayItem from './day_item'
import { Flex, Checkbox } from '@gm-pc/react'
import _ from 'lodash'
import store from '../store'
import { toJS } from 'mobx'
const DayList = observer(() => {
  const { menuList, menuPeriodGroup, selectedAll } = store
  console.log(toJS(menuList), 'menuList')
  const handleCheck = () => {
    store.changeSelectedAll()
  }

  return (
    <Flex className='gm-position-relative'>
      <div
        className='gm-position-absolute gm-border-bottom gm-border-right'
        style={{ zIndex: 1, left: 0, width: '40px' }}
      >
        <Flex alignCenter justifyCenter style={{ height: '59px' }}>
          <div style={{ marginTop: '10px' }}>
            <Checkbox onChange={handleCheck} checked={selectedAll} />
          </div>
        </Flex>
        <div className='gm-back-bg gm-padding-top-5'>
          {_.map(menuPeriodGroup.slice(), (item, index) => {
            return (
              <Flex
                key={index}
                alignCenter
                style={{ height: '231px' }}
                className='gm-border-bottom'
              >
                {item.name}
              </Flex>
            )
          })}
        </div>
      </div>
      <Flex className='gm-overflow-y' style={{ marginLeft: '40px' }}>
        {_.map(menuList.slice(), (item, index) => {
          return <DayItem dayIndex={index} />
        })}
      </Flex>
    </Flex>
  )
})

export default DayList
