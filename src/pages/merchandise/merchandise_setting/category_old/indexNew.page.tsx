import React from 'react'
import Filter from './filter'
import List from './list'

/** 商品分类管理 */
const Category = () => {
  return (
    <div className='gm-site-card-border-less-wrapper-50'>
      <Filter />
      <List />
    </div>
  )
}

export default Category
