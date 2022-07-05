import React, { FC, useEffect } from 'react'
import { HeaderDetail, EditDetail } from '../components'
import store from '../stores/receipt_store'
import { useGMLocation } from '@gm-common/router'

import { useAsync } from '@gm-common/hooks'
import { LoadingChunk } from '@gm-pc/react'
import { observer } from 'mobx-react'

const Detail: FC = observer(() => {
  const { sheet_id } = useGMLocation<{
    sheet_id: string
  }>().query

  const { run, loading } = useAsync(() =>
    store.fetchStockSheet(sheet_id).then((data) => {
      store.adapterStockSheet(data.response)
    }),
  )

  useEffect(() => {
    run()
  }, [])

  return (
    <LoadingChunk loading={loading || store.receiptLoading}>
      <HeaderDetail type='detail' />
      <EditDetail />
    </LoadingChunk>
  )
})

export default Detail
