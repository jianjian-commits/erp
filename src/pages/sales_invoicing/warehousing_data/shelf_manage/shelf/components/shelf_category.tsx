import React, { useRef, FC } from 'react'
import { observer } from 'mobx-react'
import { toJS } from 'mobx'
import { Flex, Tree, TreeListItem } from '@gm-pc/react'
import store from '../store'

import '../../style.less'
import { ComCategory } from '../../interface'
import { t } from 'gm-i18n'
import { useLogger } from 'react-use'

interface CategoryItemProps {
  data: ComCategory
}

const CategoryItem: FC<CategoryItemProps> = observer(({ data }) => {
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
    </Flex>
  )
})

const CategoryTree = observer(() => {
  const { categoryTree } = store

  // useLogger(
  //   'categoryTree',
  //   toJS(categoryTree),
  //   toJS(store.selectedCategory.value),
  // )

  const handleSelect = (selected: string, data: TreeListItem) => {
    store.changeActiveCategory(data)
    // store.fetchBatch(data.value)
  }

  return (
    <Flex flex className='b-width-100-percent b-height-100-percent b-shelf'>
      <Tree
        list={toJS(categoryTree)}
        showFind
        disabledCheckbox
        withFilter={false}
        activeValue={store.selectedShelf.value}
        onActiveValue={handleSelect}
        renderGroupItem={(data: ComCategory) => {
          return <CategoryItem data={data} key={data.value} />
        }}
        renderLeafItem={(data: ComCategory) => {
          return <CategoryItem data={data} key={data.value} />
        }}
        style={{ border: 'none' }}
      />
    </Flex>
  )
})

export default CategoryTree
