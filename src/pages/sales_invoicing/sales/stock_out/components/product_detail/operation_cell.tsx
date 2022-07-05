import React, { FC } from 'react'
import { TableXUtil } from '@gm-pc/table-x'
import { observer } from 'mobx-react'

import { DetailStore } from '../../stores/index'

const { EditOperation } = TableXUtil

interface Props {
  onAddRow: () => void
  index: number
}

const OperationCell: FC<Props> = observer((props) => {
  const { onAddRow, index } = props
  const { productDetails } = DetailStore

  const delDisable = productDetails.length === 1

  const handleAdd = () => {
    onAddRow()
  }

  const handleDel = () => {
    DetailStore.deleteProductDetails(index)
  }

  return (
    <EditOperation
      onAddRow={handleAdd}
      onDeleteRow={delDisable ? undefined : handleDel}
    />
  )
})

export default OperationCell
