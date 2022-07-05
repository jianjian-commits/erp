import React, { useEffect } from 'react'
import {
  HeaderDetail,
  DetailTable,
  Apportion,
  Discount,
  EditDetail,
  SettleTip,
} from '../components'
import { useGMLocation } from '@gm-common/router'
import { useAsync } from '@gm-common/hooks'
import { LoadingChunk } from '@gm-pc/react'
import { canEdit } from '@/pages/sales_invoicing/util'
import { observer } from 'mobx-react'
import TableListTips from '@/common/components/table_list_tips'
import { t } from 'gm-i18n'
import globalStore from '@/stores/global'
import { DetailStore } from '../stores'

const Detail = () => {
  const { sheet_id } = useGMLocation<{
    sheet_id: string
  }>().query
  const {
    receiptLoading,
    receiptDetail: { settle_sheet_serial_no, settle_sheet_id, sheet_status },
    fetchSupplier,
    fetchPurchaser,
    fetchStockSheet,
  } = DetailStore

  const { run, loading } = useAsync(() =>
    Promise.all([fetchSupplier(), fetchStockSheet(sheet_id), fetchPurchaser()]),
  )

  useEffect(() => {
    if (sheet_id) {
      run()
    } else {
      fetchSupplier()
      fetchPurchaser()
    }
    // store.setOpenBasicPriceState()

    return DetailStore.clear
  }, [])

  const isAdd = canEdit(sheet_status)
  return (
    <LoadingChunk loading={(loading && !!sheet_id) || receiptLoading}>
      <HeaderDetail type={isAdd ? 'add' : 'detail'} />
      {settle_sheet_serial_no && (
        <TableListTips
          tips={[
            <SettleTip
              tip={t('当前入库单关联结款单')}
              text={settle_sheet_serial_no}
              id={settle_sheet_id}
              key='settle'
            />,
          ]}
        />
      )}
      {isAdd ? <EditDetail /> : <DetailTable />}
      {!globalStore.isLite && (
        <>
          <Apportion type={isAdd ? 'add' : 'detail'} />
          <Discount type={isAdd ? 'add' : 'detail'} />
        </>
      )}
    </LoadingChunk>
  )
}

export default observer(Detail)
