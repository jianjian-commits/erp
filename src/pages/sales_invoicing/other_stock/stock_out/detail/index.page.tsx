import React, { useEffect } from 'react'
import { observer } from 'mobx-react'
import { useGMLocation } from '@gm-common/router'

import HeaderDetail from '../components/header_detail'
import DetailTable from '../components/detail_table'
import store from '../stores/detail_store'
import { LoadingChunk } from '@gm-pc/react'
import { useAsync } from '@gm-common/hooks'
import EditDetail from '../components/edit_detail'
import { canEdit } from '@/pages/sales_invoicing/util'

interface Query {
  sheet_id: string
}

const StockOut = observer(() => {
  const { sheet_id } = useGMLocation<Query>().query

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
  const isAdd = canEdit(store.receiptDetail.sheet_status)

  return (
    <LoadingChunk loading={(loading && !!sheet_id) || store.receiptLoading}>
      <HeaderDetail type={isAdd ? 'add' : 'detail'} />
      {isAdd ? <EditDetail /> : <DetailTable />}
    </LoadingChunk>
  )
})

export default StockOut
