import React, { useRef, FC } from 'react'
import { observer } from 'mobx-react'
import { toJS } from 'mobx'
import { Flex, Tree, TreeListItem } from '@gm-pc/react'
import store from '../store'
import ShelfAction from './shelf_action'
import '../../style.less'
import { t } from 'gm-i18n'
import { ComShelf } from '@/pages/sales_invoicing/warehousing_data/shelf_manage/interface'

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

  const handleSelect = (selected: string, data: TreeListItem) => {
    store.changeActiveShelf(data)
    store.fetchBatch(data.value)
  }

  return (
    <Flex flex className='b-width-100-percent b-height-100-percent b-shelf'>
      <Tree
        list={toJS(shelfTree)}
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
