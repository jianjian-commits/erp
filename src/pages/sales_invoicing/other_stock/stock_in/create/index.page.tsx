import React, { useEffect } from 'react'

import HeaderDetail from '../components/header_detail'
import EditDetail from '../components/edit_detail'
import store from '../stores/detail_store'
import { useAsync } from '@gm-common/hooks'
import { LoadingChunk } from '@gm-pc/react'
import { observer } from 'mobx-react'
import globalStore from '@/stores/global'

export default observer(() => {
  const { warehouse_id } = store.receiptDetail
  const { run, loading } = useAsync(() => store.fetchShelf())

  useEffect(() => {
    // run()

    return store.clean
  }, [])

  return (
    <LoadingChunk loading={loading}>
      <HeaderDetail type='add' />
      {globalStore.isOpenMultWarehouse ? (
        warehouse_id && <EditDetail />
      ) : (
        <EditDetail />
      )}
    </LoadingChunk>
  )
})
