import React from 'react'
import { observer } from 'mobx-react'
import DayItem from './day_item'
import { Flex, Checkbox } from '@gm-pc/react'
import _ from 'lodash'
import store from '../store'

const DayList = observer(() => {
  return (
    <Flex className='gm-position-relative'>
      <div
        className='gm-position-absolute gm-border-bottom gm-border-right'
        style={{ zIndex: 1, left: 0, width: '60px' }}
      >
        <Flex alignCenter justifyCenter style={{ height: '59px' }}>
          <div style={{ marginTop: '10px' }}>
            <Checkbox
              onChange={() => store.setAllChecked()}
              checked={store.selectedAll}
            />
          </div>
        </Flex>
        <div className='gm-back-bg gm-padding-top-5'>
          {_.map(store.menuPeriodGroup.slice(), (item, index) => {
            return (
              <Flex
                key={index}
                alignCenter
                justifyCenter
                style={{ height: '231px' }}
                className='gm-border-bottom'
                column
              >
                {item.name}
                <Checkbox
                  onChange={() => store.setPeriodChecked(index)}
                  checked={store.checkPeriodArr[index]}
                />
              </Flex>
            )
          })}
        </div>
      </div>
      <Flex className='gm-overflow-y' style={{ marginLeft: '60px' }}>
        {_.map(store.menuList, (_, index) => {
          return <DayItem dayIndex={index} />
        })}
      </Flex>
    </Flex>
  )
})

export default DayList
