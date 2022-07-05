import React, { useEffect } from 'react'
import Header from '../components/detail/header'
import { EditList } from '../components/detail/list'
import Panel from '../components/detail/panel'
import globalStore from '@/stores/global'
import store from '../components/detail/store'
import { setTitle } from '@gm-common/tool'

/**
 * 新建订单
 */
export default () => {
  useEffect(() => {
    store.updateOrderInfo('view_type', 'create')
    globalStore.fetchOrderSetting()
    store.order.view_type === 'create' && setTitle('订单列表')
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
