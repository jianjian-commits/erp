import { t } from 'gm-i18n'
import { gmHistory as history, useGMLocation } from '@gm-common/router'
import { setTitle } from '@gm-common/tool'
import { Flex, Loading } from '@gm-pc/react'
import { Permission } from 'gm_api/src/enterprise'
import React, { useEffect } from 'react'
import { observer } from 'mobx-react'
import Header from './components/header'
import List from './components/list'
import store from './store'

setTitle(t('订单详情'))

const OrderDetailByMenu = () => {
  const location = useGMLocation<{ id: string }>()
  useEffect(() => {
    store.setEditPermission(Permission.PERMISSION_ORDER_UPDATE_ORDER)
    store.updateOrderInfo('view_type', 'view')
    store.fetchOrder(location.query.id)
    return () => {
      if (history.location.pathname.includes('copy')) {
        history.replace('/order/order_manage/create')
        return
      }
      store.init()
    }
  }, [])

  if (store.loading) {
    return (
      <Flex justifyCenter style={{ marginTop: 50 }}>
        <Loading size='40' />
      </Flex>
    )
  }
  return (
    <>
      <Header />
      <List />
    </>
  )
}

export default observer(OrderDetailByMenu)
