import React, { FC, useEffect } from 'react'
import Filter from './filter'
import List from './list'
import store from './store'
import './style.less'

interface ProductProps {
  quotation_id: string
  type: number
}
/**
 * 报价单下商品列表
 */
const Product: FC<ProductProps> = ({ quotation_id, type }) => {
  useEffect(() => {
    if (quotation_id) {
      store.fetchList(quotation_id)
      store.getTreeData()
    }
    return () => store.clearStore()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [quotation_id])

  return (
    <>
      <Filter type={type} quotationId={quotation_id} />
      <List />
    </>
  )
}

export default Product
