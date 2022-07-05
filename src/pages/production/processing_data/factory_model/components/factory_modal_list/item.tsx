import React, { FC, MouseEvent } from 'react'
import classNames from 'classnames'
import { observer } from 'mobx-react'

import Actions from './actions'
import SVGDownTriangle from '@/svg/down_triangle.svg'
import Edit from './edit'
import { ProcessorItem } from '../../interface'
import ItemChildren from './item_children'
import store from '../../store'

interface Props {
  item: ProcessorItem
  menu: ProcessorItem[]
  isDefault?: boolean
}

const Item: FC<Props> = observer(({ item, menu, isDefault }) => {
  const { current_modal } = store
  const { current_selected_modal } = current_modal
  const handleToggleIcon = (show: boolean) => {
    if (item.edit) return
    store.updateFactoryModalItem(
      item.parent_id || '',
      item.processor_id,
      'showIcon',
      show,
    )
  }

  const handleCurrentSelectedModal = () => {
    store.setCurrentSelectedModal(item)
  }

  const expandFactoryModal = (event: MouseEvent<HTMLSpanElement>) => {
    event.stopPropagation()
    store.updateFactoryModalItem(
      item.parent_id || '',
      item.processor_id,
      'expand',
      !item.expand,
    )
  }

  return (
    <>
      <div
        className={classNames('b-factory-list-item', {
          'b-factory-list-item-selected':
            current_selected_modal?.processor_id === item.processor_id,
        })}
        onClick={() => handleCurrentSelectedModal()}
        onMouseEnter={() => handleToggleIcon(true)}
        onMouseLeave={() => handleToggleIcon(false)}
      >
        {item.edit ? (
          <Edit item={item} />
        ) : (
          <>
            {item.name}
            {item.showIcon && (
              <Actions item={item} menu={menu} isDefault={isDefault} />
            )}
            {item.children && item.children.length > 0 && (
              <span
                className='b-factory-list-icon'
                onClick={expandFactoryModal}
              >
                {item.expand ? (
                  <SVGDownTriangle />
                ) : (
                  <SVGDownTriangle className='b-factory-list-icon-triangle' />
                )}
              </span>
            )}
          </>
        )}
      </div>
      {item.expand && item.children.length > 0 && (
        <ItemChildren menu={item.children} />
      )}
    </>
  )
})

export default Item
