import * as React from 'react'
import { useEffect } from 'react'
import { observer } from 'mobx-react'
import { LoadingChunk } from '@gm-pc/react'
import { useAsync } from '@gm-common/hooks'
import { useGMLocation } from '@gm-common/router'

import { HeaderDetail, DetailTable, EditDetail } from '../components'

import { canEdit } from '@/pages/sales_invoicing/util'

import store from '../stores/detail_store'

const Detail = () => {
  const { sheet_id } = useGMLocation<{
    sheet_id: string
  }>().query

  const isAdd = canEdit(store.receiptDetail.sheet_status)

  const { run, loading } = useAsync(() =>
    Promise.all([
      store.fetchShelf(),
      store.fetchCustomer(),
      store.fetchStockSheet(sheet_id),
    ]).then((data) => {
      store.adapterStockSheet(data[2].response)

      return data
    }),
  )

  useEffect(() => {
    if (sheet_id) {
      run()
    } else {
      store.fetchShelf()
      store.fetchCustomer()
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
