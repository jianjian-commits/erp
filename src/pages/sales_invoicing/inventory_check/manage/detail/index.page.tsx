import React from 'react'
import { observer } from 'mobx-react'
import { LoadingChunk } from '@gm-pc/react'
import { useGMLocation } from '@gm-common/router'
import { useAsync } from '@gm-common/hooks'
import { canEdit } from '@/pages/sales_invoicing/util'

import HeaderDetail from '../components/head_detail'
import DetailTable from '../components/detail_table'
import EditDetail from '../components/edit_detail'
import store from '../stores/detail_store'
import { useMount, useUnmount } from 'react-use'

interface Query {
  sheet_id: string
}

const Manage = observer(() => {
  const { sheet_id } = useGMLocation<Query>().query

  const { run, loading } = useAsync(() =>
    Promise.all([store.fetchShelf(), store.fetchStockSheet(sheet_id)]),
  )

  useMount(() => {
    if (sheet_id) {
      run()
    }
  })

  useUnmount(store.clean)

  const isAdd = canEdit(store.receiptDetail.sheet_status)

  return (
    <LoadingChunk loading={(loading && !!sheet_id) || store.receiptLoading}>
      <HeaderDetail type={isAdd ? 'add' : 'detail'} />
      {isAdd ? <EditDetail /> : <DetailTable />}
    </LoadingChunk>
  )
})

export default Manage
