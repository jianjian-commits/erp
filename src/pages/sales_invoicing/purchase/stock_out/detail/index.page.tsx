import React, { useEffect } from 'react'
import {
  HeaderDetail,
  DetailTable,
  Discount,
  EditDetail,
  SettleTip,
} from '../components'
import store from '../stores/receipt_store'
import { useGMLocation } from '@gm-common/router'
import { useAsync } from '@gm-common/hooks'
import { LoadingChunk } from '@gm-pc/react'
import { canEdit } from '@/pages/sales_invoicing/util'

import { observer } from 'mobx-react'
import TableListTips from '@/common/components/table_list_tips'

const Detail = () => {
  const { sheet_id } = useGMLocation<{
    sheet_id: string
  }>().query
  const { settle_sheet_serial_no } = store.receiptDetail

  const isAdd = canEdit(store.receiptDetail.sheet_status)

  const { run, loading } = useAsync(() =>
    Promise.all([
      store.fetchShelf(),
      store.fetchSupplier(),
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
      store.fetchSupplier()
    }

    return store.clear
  }, [])

  return (
    <LoadingChunk loading={(loading && !!sheet_id) || store.receiptLoading}>
      <HeaderDetail type={isAdd ? 'add' : 'detail'} />
      {settle_sheet_serial_no && (
        <TableListTips tips={[<SettleTip key='settle' />]} />
      )}
      {isAdd ? <EditDetail /> : <DetailTable />}
      <Discount type={isAdd ? 'add' : 'detail'} />
    </LoadingChunk>
  )
}

export default observer(Detail)
