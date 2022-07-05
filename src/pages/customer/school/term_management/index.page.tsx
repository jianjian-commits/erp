import React, { useEffect } from 'react'
import { observer } from 'mobx-react'
import List from './components/list'
import store from './store/storeList'

const TermManagement = () => {
  useEffect(() => {
    store.fetchListTerm()
    return () => store.init()
  }, [])

  return <List />
}

export default observer(TermManagement)
