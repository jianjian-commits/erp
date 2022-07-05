import React, { FC } from 'react'
import { TableXUtil } from '@gm-pc/table-x'
import { observer } from 'mobx-react'
import _ from 'lodash'
import store from '../../stores/detail_store'
import { checkDigit } from '@/common/util'

const { EditOperation } = TableXUtil
interface Props {
  index: number
  onAddRow: (index: number) => void
}
const OperationCell: FC<Props> = observer((props) => {
  const { onAddRow, index } = props
  const { productList, receiptDetail } = store

  const isForVirtual = checkDigit(receiptDetail.status, 8)

  const delDisable = productList.length === 1

  const handleAdd = () => {
    onAddRow(index)
  }

  const handleDel = () => {
    store.deleteProductList(index)
  }

  return (
    <EditOperation
      onAddRow={isForVirtual ? undefined : handleAdd}
      onDeleteRow={delDisable ? undefined : handleDel}
    />
  )
})

export default OperationCell
