import React, { useRef, FC } from 'react'
import { observer } from 'mobx-react'
import { Flex, Tree, TreeListItem } from '@gm-pc/react'
import store from '../store'
import ShelfAction from './shelf_action'
import '../../style.less'
import { ComShelf } from '../../interface'
import { t } from 'gm-i18n'

interface ShelfItemProps {
  data: ComShelf
}

const ShelfItem: FC<ShelfItemProps> = observer(({ data }) => {
  const itemRef = useRef(null)
  return (
    <Flex
      justifyBetween
      alignCenter
      className='b-shelf-item'
      ref={itemRef}
      data-name='shelfItem'
    >
      <Flex alignCenter justifyBetween>
        {data.text}
        {data.is_leaf && (
          <span className='b-shelf-item-sign'>{t('可入库')}</span>
        )}
      </Flex>

      <ShelfAction data={data} />
    </Flex>
  )
})

const ShelfTree = observer(() => {
  const { shelfTree } = store

  // 就是一个log，没啥作用
  // useLogger('ShelfTree', toJS(shelfTree), toJS(store.selectedShelf.value))

  const handleSelect = (selected: string, data: TreeListItem) => {
    store.changeActiveShelf(data)
  }

  return (
    <Flex flex className='b-width-100-percent b-height-100-percent b-shelf'>
      <Tree
        list={shelfTree.slice()}
        showFind
        disabledCheckbox
        withFilter={false}
        activeValue={store.selectedShelf.value}
        onActiveValue={handleSelect}
        renderGroupItem={(data: ComShelf) => {
          return <ShelfItem data={data} key={data.value} />
        }}
        renderLeafItem={(data: ComShelf) => {
          return <ShelfItem data={data} key={data.value} />
        }}
        style={{ border: 'none' }}
      />
    </Flex>
  )
})

export default ShelfTree
