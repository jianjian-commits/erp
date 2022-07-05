import React, { useEffect } from 'react'
import { HeaderDetail, EditDetail, Discount } from '../components'
import store from '../stores/receipt_store'
import { observer } from 'mobx-react'
import { useAsync } from '@gm-common/hooks'
import { LoadingChunk } from '@gm-pc/react'
import globalStore from '@/stores/global'

const Create = observer(() => {
  const { warehouse_id, supplier_id } = store.receiptDetail

  const { run, loading } = useAsync(() =>
    Promise.all([store.fetchSupplier(), store.fetchShelf()]),
  )

  useEffect(() => {
    run()

    return store.clear
  }, [])

  const renderDetail = () => {
    return supplier_id !== '0' ? (
      <>
        <EditDetail />
        <Discount type='add' />
      </>
    ) : null
  }

  return (
    <LoadingChunk loading={loading}>
      <HeaderDetail type='add' />
      {globalStore.isOpenMultWarehouse
        ? warehouse_id && renderDetail()
        : renderDetail()}
    </LoadingChunk>
  )
})

export default Create
