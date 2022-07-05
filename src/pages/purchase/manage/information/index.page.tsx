import React, { useEffect } from 'react'
import Filter from './components/filter'
import List from './components/list'
import store from './store'

const Information = () => {
  useEffect(() => {
    store.fetchPurchaser()
    store.fetchSuppliers()
  }, [])
  return (
    <>
      <Filter />
      <List />
    </>
  )
}

export default Information
