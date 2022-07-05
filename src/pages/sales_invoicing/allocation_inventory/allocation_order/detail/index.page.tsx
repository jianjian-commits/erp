import React, { useEffect } from 'react'
import { HeaderDetail, EditDetail, Apportion, DetailTable } from '../components'
import store from '../stores/receipt_store'

import { useAsync } from '@gm-common/hooks'
import { LoadingChunk } from '@gm-pc/react'
import { observer } from 'mobx-react'
import { canEdit } from '@/pages/sales_invoicing/util'
import { useGMLocation } from '@gm-common/router'

const Detail = () => {
  const { sheet_id } = useGMLocation<{ sheet_id: string }>().query
  const { run, loading } = useAsync(() => Promise.all([store.fetchSkuList()]))

  useEffect(() => {
    run().then((json) => {
      // store.initSku(json[0].response)
      store.getTransferSheetDetail(sheet_id)
    })
    return store.clear
  }, [])

  const isAdd = canEdit(store.receiptDetail.status)
  const type = isAdd ? 'add' : 'detail'

  return (
    <LoadingChunk loading={loading || store.receiptLoading}>
      <HeaderDetail type={type} />
      {isAdd ? <EditDetail /> : <DetailTable />}
      <Apportion type={type} />
    </LoadingChunk>
  )
}

export default observer(Detail)
