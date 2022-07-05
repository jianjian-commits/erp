import React, { FC } from 'react'
import _ from 'lodash'
import { observer } from 'mobx-react'

import Item from './item'
import { ProcessorItem } from '../../interface'

interface ItemChildrenProps {
  menu: ProcessorItem[]
}

const ItemChildren: FC<ItemChildrenProps> = observer(({ menu }) => {
  return (
    <div className='b-factory-children'>
      <ul className='b-factory-list'>
        {_.map(menu, (item, index) => (
          <li className='b-factory-list-block-item' key={index}>
            <Item item={item} menu={menu} />
          </li>
        ))}
      </ul>
    </div>
  )
})

export default ItemChildren
