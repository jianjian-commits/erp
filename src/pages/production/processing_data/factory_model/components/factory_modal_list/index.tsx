import React from 'react'
import _ from 'lodash'
import { observer } from 'mobx-react'

import Item from './item'
import store from '../../store'
import './style.less'

const List = observer(() => {
  const { factory_modal_list } = store

  // 增加一个未分配可以新建的车间
  return (
    <ul className='b-factory-list b-factory-container' id='b-factory-container'>
      {_.map(factory_modal_list, (item, index) => (
        <li key={index} className='b-factory-list-block'>
          <Item
            item={item}
            menu={factory_modal_list}
            isDefault={item.processor_id === '0'}
          />
        </li>
      ))}
    </ul>
  )
})

export default List
