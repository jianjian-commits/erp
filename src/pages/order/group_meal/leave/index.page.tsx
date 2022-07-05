import React, { useEffect } from 'react'
import { observer } from 'mobx-react'
import Filter from './components/filter'
import List from './components/list'
import './style.less'
import store from './store'
export default observer(() => {
  useEffect(() => {
    store.getCurstomerMenu()
    return () => {
      store.init()
    }
  }, [])
  return (
    <div className='leave'>
      <Filter />
      <List />
    </div>
  )
})
