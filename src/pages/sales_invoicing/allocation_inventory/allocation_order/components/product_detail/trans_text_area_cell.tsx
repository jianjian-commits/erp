import React, { FC } from 'react'
import { observer } from 'mobx-react'
import globalStore from '@/stores/global'
import { TextAreaCell } from '@/pages/sales_invoicing/components'

interface TransAreaTextCellProps {
  data: any
  field: 'currStockQuantity' | 'category'
}

const TransAreaTextCell: FC<TransAreaTextCellProps> = observer(
  ({ data, field }) => {
    const {
      currStockQuantity,
      sku: {
        categoryName,
        category_name_1,
        category_name_2,
        category_name_3,
        spu_name,
        base_unit_id,
      },
    } = data

    const productData = {
      ...data,
      category_name_1,
      category_name_2,
      category_name_3,
      categoryName,
      spu_name,
      currStockQuantity,
      sku_base_unit_name: globalStore.getUnitName(base_unit_id!),
      input_stock: data.input_in_stock,
    }
    return <TextAreaCell data={productData} field={field} />
  },
)

export default TransAreaTextCell
