import React, { useEffect } from 'react'
import { gmHistory as history, useGMLocation } from '@gm-common/router'
import { Loading, Flex } from '@gm-pc/react'
import { observer } from 'mobx-react'
import { Tabs } from 'antd'
import Header from '../../components/detail/header'
import {
  ViewList,
  EditList,
  AfterSaleRecordList,
  OperationLogList,
} from '../../components/detail/list'
import Panel from '../../components/detail/panel'
import store from '../../components/detail/store'
import { Permission } from 'gm_api/src/enterprise'
import { App_Type } from 'gm_api/src/common'
import { t } from 'gm-i18n'
import './index.less'
import globalStore from '@/stores/global'

/**
 * 订单详情
 * 存在编辑态和观察态
 */
export default observer(() => {
  const location = useGMLocation<{ id: string; type?: string }>()

  useEffect(() => {
    store.setEditPermission(Permission.PERMISSION_ORDER_UPDATE_ORDER)
    store.updateOrderInfo('view_type', 'view')
    store.fetchOrder(location.query.id)
    store.setType(+location.query.type! || App_Type.TYPE_UNSPECIFIED)

    // 这里要处理一下复制订单的操作
    return () => {
      if (history.location.pathname.includes('copy')) {
        store.init4Copy()
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

  const list = (
    <Panel>
      {store.order.view_type === 'view' ? <ViewList /> : <EditList />}
    </Panel>
  )

  return (
    <>
      <Header />
      {globalStore.isLite ? (
        list
      ) : (
        <Tabs
          className='oreder-detail-tabs'
          size='small'
          destroyInactiveTabPane
        >
          <Tabs.TabPane tab={t('商品明细')} key='1'>
            {list}
          </Tabs.TabPane>
          <Tabs.TabPane tab={t('售后记录')} key='2'>
            <AfterSaleRecordList />
          </Tabs.TabPane>
          <Tabs.TabPane tab={t('操作日志')} key='3'>
            <OperationLogList />
          </Tabs.TabPane>
        </Tabs>
      )}
    </>
  )
})
