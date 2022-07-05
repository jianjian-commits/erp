import React, { FC } from 'react'
import { observer } from 'mobx-react'
import { TableXUtil } from '@gm-pc/table-x'
import { ProductDetailProps } from '../../stores/details_store'
import { DetailStore } from '../../stores/index'

const { EditOperation } = TableXUtil

interface Props {
  index: number
  data: ProductDetailProps
  onAddRow: (index: number) => void
}

const OperationCell: FC<Props> = observer((props) => {
  const { onAddRow, index } = props
  const { productDetails, deleteProductDetails } = DetailStore

  const handleDel = () =>
    productDetails.length === 1 ? undefined : deleteProductDetails(index)

  return (
    <EditOperation onAddRow={() => onAddRow(index)} onDeleteRow={handleDel} />
  )
})

export default OperationCell
