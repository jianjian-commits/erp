import React, { useEffect } from 'react'
import Header from '../components/detail/header'
import { EditList } from '../components/detail/list'
import Panel from '../components/detail/panel'
import store from '../components/detail/store'

export default () => {
  useEffect(() => {
    store.updateOrderInfo('view_type', 'create')
    store.updateOrderInfo('repair', true)
    return () => {
      store.init()
    }
  }, [])
  return (
    <>
      <Header />
      <Panel>
        <EditList />
      </Panel>
    </>
  )
}
