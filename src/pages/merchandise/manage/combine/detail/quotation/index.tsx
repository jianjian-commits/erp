import React, { useEffect, FC } from 'react'
import List from './components/list'
import Filter from './components/filter'
import store from './store'
import '../../style.less'
interface CombineProps {
  sku_id: string
}
const Combine: FC<CombineProps> = ({ sku_id }) => {
  useEffect(() => {
    store.getQuotationList()
    store.setSkuId(sku_id)
    return () => store.clearStore()
  }, [])
  return (
    <div className='combine-detail-quotation'>
      <Filter />
      <List />
    </div>
  )
}

export default Combine
