import React, { useEffect } from 'react'
import { HeaderDetail, EditDetail } from '../components'
import store from '../stores/receipt_store'

import { OutStorageScan } from '@/pages/sales_invoicing/components/scan'
import { useAsync } from '@gm-common/hooks'
import { LoadingChunk } from '@gm-pc/react'
import { observer } from 'mobx-react-lite'
import globalStore from '@/stores/global'

const Create = observer(() => {
  const { run, loading } = useAsync(() => Promise.all([store.fetchProcess()]))

  useEffect(() => {
    run()
    return store.clear
  }, [])

  const { warehouse_id } = store.receiptDetail

  const renderDetail = () => {
    if (globalStore.isOpenMultWarehouse && !warehouse_id) return null
    return (
      <>
        <EditDetail />
        <OutStorageScan
          onEnsure={(data) => {
            store.handleScanData(data)
          }}
          type='refundMaterial'
        />
      </>
    )
  }

  return (
    <LoadingChunk loading={loading}>
      <HeaderDetail type='add' />
      {renderDetail()}
    </LoadingChunk>
  )
})

export default Create
