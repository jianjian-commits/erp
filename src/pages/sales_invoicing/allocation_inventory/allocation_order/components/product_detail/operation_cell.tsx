import React, { FC } from 'react'
import { TableXUtil } from '@gm-pc/table-x'
import { observer } from 'mobx-react'
import _ from 'lodash'
import store, { PDetail } from '../../stores/receipt_store'
import { isInShareV2 } from '../../../../util'
import { checkDigit } from '@/common/util'

const { EditOperation } = TableXUtil

interface Props {
  index: number
  data: PDetail
  onAddRow: (index: number) => void
}

const OperationCell: FC<Props> = observer((props) => {
  const { onAddRow, index, data } = props
  const { costAllocations, productDetails, receiptDetail } = store
  const isForVirtual = checkDigit(receiptDetail.status, 8)

  // 有费用分摊时，不能删除商品
  const delDisable =
    isInShareV2(costAllocations, data?.sku_id) ||
    productDetails.length === 1 ||
    isForVirtual

  const handleAdd = () => {
    onAddRow(index)
  }

  const handleDel = () => {
    store.deleteProductDetails(index)
  }

  return (
    <EditOperation
      onAddRow={isForVirtual ? undefined : handleAdd}
      onDeleteRow={delDisable ? undefined : handleDel}
    />
  )
})

export default OperationCell
