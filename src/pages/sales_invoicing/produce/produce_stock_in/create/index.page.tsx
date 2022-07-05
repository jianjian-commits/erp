import React, { useEffect } from 'react'
import { HeaderDetail, EditDetail, Apportion } from '../components'
import store from '../stores/receipt_store'

import { OutStorageScan } from '@/pages/sales_invoicing/components/scan'
import { useAsync } from '@gm-common/hooks'
import { LoadingChunk } from '@gm-pc/react'
import { observer } from 'mobx-react'
import _ from 'lodash'
import globalStore from '@/stores/global'

const Create = () => {
  const { warehouse_id } = store.receiptDetail
  const { run, loading } = useAsync(() =>
    Promise.all([
      // store.fetchShelf(),
      store.fetchCustomer(),
      store.fetchRouter(),
    ]),
  )

  useEffect(() => {
    run()
    return store.clear
  }, [])

  const renderDetail = () => {
    if (globalStore.isOpenMultWarehouse && !warehouse_id) return null
    return (
      <>
        <EditDetail />
        <Apportion type='add' />
        <OutStorageScan
          verifyCode={(barcode) => {
            if (_.startsWith(barcode.trim(), 'N')) {
              return 'onSearch'
            } else {
              return 'onEnsure'
            }
          }}
          onEnsure={(data) => {
            store.handleScanData(data)
          }}
          onSearch={(code) => {
            store.handleScanInnerLabelData(code)
          }}
          type='produceStockIn'
        />
      </>
    )
  }

  return (
    <LoadingChunk loading={loading || store.receiptLoading}>
      <HeaderDetail type='add' />
      {renderDetail()}
    </LoadingChunk>
  )
}

export default observer(Create)
