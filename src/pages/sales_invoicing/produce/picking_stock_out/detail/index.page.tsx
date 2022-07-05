import React, { useEffect } from 'react'
import { observer } from 'mobx-react'
import { useGMLocation } from '@gm-common/router'
import { useAsync } from '@gm-common/hooks'
import { LoadingChunk } from '@gm-pc/react'

import { OutStorageScan } from '@/pages/sales_invoicing/components/scan'
import { canEdit } from '@/pages/sales_invoicing/util'

import { HeaderDetail, DetailTable, EditDetail } from '../components'

import { DetailStore } from '../stores/index'

const Detail = () => {
  const {
    fetchShelf,
    fetchProcess,
    fetchStockSheet,
    adapterStockSheet,
    clear,
    receiptDetail,
    receiptLoading,
    handleScanData,
  } = DetailStore

  const { sheet_id } = useGMLocation<{
    sheet_id: string
  }>().query

  const { run, loading } = useAsync(() =>
    Promise.all([fetchShelf(), fetchProcess(), fetchStockSheet(sheet_id)]).then(
      (data) => {
        adapterStockSheet(data[2].response)
        return data
      },
    ),
  )

  useEffect(() => {
    if (sheet_id) {
      run()
    } else {
      fetchShelf()
    }

    return clear
  }, [])

  const isAdd = canEdit(receiptDetail.sheet_status)

  return (
    <LoadingChunk loading={(loading && !!sheet_id) || receiptLoading}>
      <HeaderDetail type={isAdd ? 'add' : 'detail'} />
      {isAdd ? <EditDetail /> : <DetailTable />}
      {isAdd && (
        <OutStorageScan
          onEnsure={(data) => handleScanData(data)}
          type='getMaterial'
        />
      )}
    </LoadingChunk>
  )
}

export default observer(Detail)
