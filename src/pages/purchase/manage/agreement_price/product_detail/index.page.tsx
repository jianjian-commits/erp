import React, { useEffect } from 'react'
import { observer } from 'mobx-react'
import List from './list'
import store from './store'

const Detail = () => {
  useEffect(() => {
    return () => {
      store.resetData()
    }
  }, [])
  return (
    <>
      <List />
    </>
  )
}

export default observer(Detail)
