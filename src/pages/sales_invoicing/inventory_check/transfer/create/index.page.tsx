import React, { useEffect } from 'react'
import { observer } from 'mobx-react'
import HeaderDetail from '../components/head_detail'
import EditDetail from '../components/edit_detail'
import { LoadingChunk } from '@gm-pc/react'
import { useAsync } from '@gm-common/hooks'

import store from '../stores/detail_store'
import globalStore from '@/stores/global'
import { useEffectOnce } from '@/common/hooks'
import { execMutiWarehouseJudge } from '@/pages/sales_invoicing/util'

export default observer(() => {
  const {
    receiptDetail: { warehouse_id },
  } = store
  const { run, loading } = useAsync(() => Promise.all([store.fetchSupplier()]))
  const fetchShelf = () => {
    store.fetchTransferShelf()
  }

  // useEffectOnce(fetchShelf, warehouse_id)

  useEffect(() => {
    fetchShelf()
  }, [warehouse_id])

  useEffect(() => {
    run()
    // 未开启多仓不需要warehoouse_id
    execMutiWarehouseJudge(fetchShelf)
    return store.clean
  }, [])

  const renderTable = () => {
    if (globalStore.isOpenMultWarehouse) {
      return warehouse_id ? <EditDetail /> : null
    } else {
      return <EditDetail />
    }
  }

  return (
    <LoadingChunk loading={loading}>
      <HeaderDetail type='add' />
      {renderTable()}
    </LoadingChunk>
  )
})
