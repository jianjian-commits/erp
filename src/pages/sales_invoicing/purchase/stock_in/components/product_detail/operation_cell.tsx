import React, { FC } from 'react'
import { TableXUtil } from '@gm-pc/table-x'
import { observer } from 'mobx-react'
import { PDetail } from '../../stores/receipt_store1'
import { DetailStore } from '../../stores'
import { isInShareV2 } from '../../../../util'

const { EditOperation } = TableXUtil

interface Props {
  index: number
  data: PDetail
  onAddRow: (index: number) => void
}

const OperationCell: FC<Props> = observer((props) => {
  const { onAddRow, index, data } = props

  const { apportionList, productDetails, receiptDetail } = DetailStore
  const isForVirtual = receiptDetail?.is_replace

  const delDisable =
    isInShareV2(apportionList, data.sku_id) ||
    productDetails.length === 1 ||
    isForVirtual

  const handleAdd = () => {
    onAddRow(index)
  }

  const handleDel = () => {
    DetailStore.deleteProductDetails(index)
  }

  return (
    <EditOperation
      onAddRow={isForVirtual ? undefined : handleAdd}
      onDeleteRow={delDisable ? undefined : handleDel}
    />
  )
})

export default OperationCell
