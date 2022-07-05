import React, { useEffect } from 'react'
import { HeaderDetail, EditDetail, Apportion } from '../components'
import store from '../stores/receipt_store'

import { LoadingChunk } from '@gm-pc/react'
import { observer } from 'mobx-react'

const Create = () => {
  const {
    receiptDetail: { out_warehouse_id, in_warehouse_id },
  } = store
  useEffect(() => store.clear, [])
  return (
    <LoadingChunk loading={store.receiptLoading}>
      <HeaderDetail type='add' />
      {out_warehouse_id && in_warehouse_id ? (
        <>
          <EditDetail />
          <Apportion type='add' />
        </>
      ) : null}
    </LoadingChunk>
  )
}

export default observer(Create)
