import React, { FC, useEffect } from 'react'
import store from './store'
import Filter from './list/filter'
import List from './list/list'

/**
 * 客户报价单列表
 */
const CustomerQuotation: FC = () => {
  useEffect(() => {
    return () => {
      store.clearStore()
    }
  }, [])

  return (
    <>
      <Filter />
      <List />
    </>
  )
}

export default CustomerQuotation
