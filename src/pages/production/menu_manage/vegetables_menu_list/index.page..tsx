import React, { useEffect } from 'react'
import { observer } from 'mobx-react'
import Filter from './components/filter'
import List from './components/list'
import store from './store'
import './style.less'

export default observer(() => {
  useEffect(() => {
    return () => store.clearStore()
  }, [])

  return (
    <>
      <Filter />
      <List />
    </>
  )
})
