import React, { useEffect } from 'react'
import Filter from './filter'
import List from './list'
import store from './store'
/**
 * 商品下报价单列表
 */
const Product = () => {
  useEffect(() => {
    store.fetchList()
    return () => store.clearStore()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className='detail-price-sheet'>
      <Filter />
      <List />
    </div>
  )
}

export default Product
