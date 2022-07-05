import { Input } from '@gm-pc/react'
import { observer } from 'mobx-react'
import * as React from 'react'
import store, { PDetail } from '../../stores/receipt_store'

import { checkDigit } from '@/common/util'
import { isSharing } from '@/pages/sales_invoicing/allocation_inventory/util'

interface Props {
  data: PDetail
  index: number
}

const RemarkCell: React.FC<Props> = observer(({ index, data }) => {
  const { sku_id, remark } = data
  const { costAllocations, receiptDetail } = store
  const skuUnits = costAllocations[0]?.sku_units || []

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target
    store.updateProductDetailsItem(index, 'remark', value)
  }

  const canEdit =
    !isSharing(skuUnits, sku_id) && !checkDigit(receiptDetail.status, 8)

  return (
    <>
      {canEdit ? (
        <Input maxLength={50} type='text' value={remark} onChange={onChange} />
      ) : (
        <>{remark}</>
      )}
    </>
  )
})

export default RemarkCell
