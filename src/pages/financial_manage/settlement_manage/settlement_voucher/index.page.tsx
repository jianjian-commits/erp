import React, { useEffect } from 'react'

import Filter from './components/filter'
import List from './components/list'

import store from './store'

const Index = () => {
  useEffect(() => {
    store.fetchList()
    return () => {
      store.initFilter()
    }
  }, [])
  return (
    <>
      <Filter />
      <List />
    </>
  )
}

export default Index
