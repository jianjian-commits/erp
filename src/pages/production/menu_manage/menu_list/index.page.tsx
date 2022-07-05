import React, { useEffect } from 'react'
import { observer } from 'mobx-react'
import Filter from './components/filter'
import ListV2 from './components/listV2'
import './style.less'
import store from './store'
export default observer(() => {
  useEffect(() => {
    return () => store.init()
  })
  return (
    <div className='menu-list'>
      <Filter />
      <ListV2 />
    </div>
  )
})
