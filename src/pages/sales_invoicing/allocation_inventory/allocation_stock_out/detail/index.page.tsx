import React, { useEffect } from 'react'
import { HeaderDetail, DetailTable, EditDetail } from '../components'
import store from '../stores/receipt_store'
import { useGMLocation } from '@gm-common/router'
import { useAsync } from '@gm-common/hooks'
import { LoadingChunk } from '@gm-pc/react'
import { canEdit } from '@/pages/sales_invoicing/util'
import { observer } from 'mobx-react'

const Detail = () => {
  const { sheet_id } = useGMLocation<{
    sheet_id: string
  }>().query

  const isAdd = canEdit(store.receiptDetail.sheet_status)

  const { run, loading } = useAsync(() =>
    Promise.all([store.fetchShelf(), store.fetchStockSheet(sheet_id)]).then(
      (data) => {
        store.adapterStockSheet(data[1].response)

        return data
      },
    ),
  )

  useEffect(() => {
    if (sheet_id) {
      run()
    } else {
      store.fetchShelf()
    }

    return store.clear
  }, [])

  return (
    <LoadingChunk loading={(loading && !!sheet_id) || store.receiptLoading}>
      <HeaderDetail type={isAdd ? 'add' : 'detail'} />
      {isAdd ? <EditDetail /> : <DetailTable />}
    </LoadingChunk>
  )
}

export default observer(Detail)
