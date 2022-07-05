import React, { FC, useEffect } from 'react'
import { observer } from 'mobx-react'
import store from './store'

import Filter from './list/filter'
import List from './list/list'

const WrapperList: FC = observer(() => {
  useEffect(() => {
    store.getTreeData()

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
})

export default WrapperList
