import React, { FC, useEffect } from 'react'
import List from './components/list'
import Filter from './components/filter'
import store from './store'

interface CombineProps {
  quotation_id: string
  type: number
}
const Combine: FC<CombineProps> = ({ quotation_id, type }) => {
  useEffect(() => {
    store.setQuotaionId(quotation_id)
    store.getCombineSkuList()
  }, [quotation_id])

  return (
    <>
      <Filter type={type} />
      <List />
    </>
  )
}

export default Combine
