import store from './store'
import { useGMLocation } from '@gm-common/router'
import { observer } from 'mobx-react'
import React, { useEffect } from 'react'
import {
  HeaderDetail,
  Discount,
  TransactionFlowTable,
  ReceiptListTable,
} from './components'
import { LoadingChunk } from '@gm-pc/react'
import { useAsync } from '@gm-common/hooks'
import { SettleSheet_SheetStatus } from 'gm_api/src/finance'

const Detail = observer(() => {
  const { sheet_id } = useGMLocation<{
    sheet_id: string
  }>().query

  const { run, loading } = useAsync(store.fetchDetail)
  useEffect(() => {
    if (sheet_id) {
      run({ settle_sheet_id: sheet_id })
    }
  }, [])
  const canEdit = [
    SettleSheet_SheetStatus.SHEET_STATUS_NOT_SUBMITTED,
    SettleSheet_SheetStatus.SHEET_STATUS_NOT_APPROVED,
  ]
  return (
    <LoadingChunk loading={loading || store.receiptLoading}>
      <HeaderDetail />
      <ReceiptListTable />
      <Discount
        type={
          canEdit.includes(store.receiptDetail.sheet_status!) ? 'add' : 'detail'
        }
      />
      <TransactionFlowTable />
    </LoadingChunk>
  )
})

export default Detail
