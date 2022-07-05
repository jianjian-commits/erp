import { observer } from 'mobx-react'
import React, { useEffect } from 'react'
import { HeaderDetail, EditDetail, Apportion, Discount } from '../components'
import DetailStore from '../stores/receipt_store'
import globalStore from '@/stores/global'

import { useAsync } from '@gm-common/hooks'
import { LoadingChunk } from '@gm-pc/react'

const Create = observer(() => {
  const {
    receiptDetail: { supplier_id, purchaser_id, warehouse_id },
    fetchSupplier,
    fetchPurchaser,
  } = DetailStore

  const { run, loading } = useAsync(() =>
    Promise.all([fetchSupplier(), fetchPurchaser()]),
  )

  useEffect(() => {
    run()
    // store.setOpenBasicPriceState()
    return DetailStore.clear
  }, [])

  const renderContent = () => {
    if (globalStore.isOpenMultWarehouse && !warehouse_id) return null
    if (supplier_id === '0' && purchaser_id === '0') return null
    return (
      <>
        <EditDetail />
        {!globalStore.isLite && (
          <>
            <Apportion type='add' />
            <Discount type='add' />
          </>
        )}
      </>
    )
  }

  return (
    <LoadingChunk loading={loading}>
      <HeaderDetail type='add' />
      {renderContent()}
    </LoadingChunk>
  )
})

export default Create
