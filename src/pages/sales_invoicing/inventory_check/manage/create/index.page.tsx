import React from 'react'
import { useUnmount } from 'react-use'
import HeaderDetail from '../components/head_detail'
import EditDetail from '../components/edit_detail'
import store from '../stores/detail_store'
import { observer } from 'mobx-react'
import globalStore from '@/stores/global'

export default observer(() => {
  const { warehouse_id } = store.receiptDetail
  useUnmount(store.init)

  return (
    <>
      <HeaderDetail type='add' />
      {globalStore.isOpenMultWarehouse ? (
        warehouse_id && <EditDetail />
      ) : (
        <EditDetail />
      )}
    </>
  )
})
