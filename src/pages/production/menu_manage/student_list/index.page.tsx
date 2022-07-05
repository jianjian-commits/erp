import React, { useEffect } from 'react'
import { observer } from 'mobx-react'
import List from './components/list'
import store from './store'
import './style.less'

export default observer(() => {
  useEffect(() => {
    const getInfo = async () => {
      await store.fetchIcons()
    }
    getInfo()
    return () => store.clear()
  }, [])

  return (
    <div className='student-list-warp'>
      <List />
    </div>
  )
})
