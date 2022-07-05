import React, { useEffect } from 'react'
import { observer } from 'mobx-react'
import _ from 'lodash'
import { useGMLocation } from '@gm-common/router'

import detailStore from '../stores/detail_store'
import HeaderDetail from '../components/header_detail'
import DetailTable from '../components/detail_table'
import { useAsync } from '@gm-common/hooks'
import { LoadingChunk } from '@gm-pc/react'
import { canEdit } from '@/pages/sales_invoicing/util'
import EditDetail from '../components/edit_detail'

const StockIn = observer(() => {
  const { sheet_id } = useGMLocation<{
    sheet_id: string
  }>().query

  const { run, loading } = useAsync(() =>
    Promise.all([
      detailStore.fetchShelf(),
      detailStore.fetchStockSheet(sheet_id),
    ]).then((data) => {
      detailStore.adapterStockSheet(data[1].response)

      return data
    }),
  )

  useEffect(() => {
    if (sheet_id) {
      run()
    } else {
      detailStore.fetchShelf()
    }

    return detailStore.clean
  }, [])
  const isAdd = canEdit(detailStore.receiptDetail.sheet_status)

  return (
    <LoadingChunk
      loading={(loading && !!sheet_id) || detailStore.receiptLoading}
    >
      <HeaderDetail type={isAdd ? 'add' : 'detail'} />
      {isAdd ? <EditDetail /> : <DetailTable />}
    </LoadingChunk>
  )
})

export default StockIn
