import React, { useEffect } from 'react'
import { observer } from 'mobx-react'
import Filter from './components/filter'
import List from './components/list'
import store from './store'
import './style.less'
const ClassManagements = observer(() => {
  useEffect(() => {
    store.getCurstomer()
    store.fetchSchoolList()
    return () => store.init()
  }, [])
  return (
    <div className='class_management'>
      <Filter />
      <List />
    </div>
  )
})

export default ClassManagements
