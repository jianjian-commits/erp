import React, { useEffect } from 'react'
import { HeaderDetail, DetailTable, Apportion, EditDetail } from '../components'
import store from '../stores/receipt_store'

import { useGMLocation } from '@gm-common/router'
import { useAsync } from '@gm-common/hooks'
import { LoadingChunk } from '@gm-pc/react'
import { OutStorageScan } from '@/pages/sales_invoicing/components/scan'
import { canEdit } from '@/pages/sales_invoicing/util'
import { observer } from 'mobx-react'
import _ from 'lodash'

const Detail = () => {
  const { sheet_id } = useGMLocation<{
    sheet_id: string
  }>().query

  const { run, loading } = useAsync(() =>
    Promise.all([
      // store.fetchShelf(),
      store.fetchCustomer(),
      store.fetchStockSheet(sheet_id),
      store.fetchRouter(),
    ]).then((data) => {
      store.adapterStockSheet(data[1].response)

      return data
    }),
  )

  useEffect(() => {
    if (sheet_id) {
      run()
    } else {
      store.fetchShelf()
      store.fetchCustomer()
      store.fetchRouter()
    }

    return store.clear
  }, [])

  const isAdd = canEdit(store.receiptDetail.sheet_status)

  return (
    <LoadingChunk loading={(loading && !!sheet_id) || store.receiptLoading}>
      <HeaderDetail type={isAdd ? 'add' : 'detail'} />
      {isAdd ? <EditDetail /> : <DetailTable />}
      {/* 暂时不做 */}
      {/* <TurnOver type='detail' /> */}
      <Apportion type={isAdd ? 'add' : 'detail'} />
      {isAdd && (
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
      )}
    </LoadingChunk>
  )
}

export default observer(Detail)
