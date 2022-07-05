import React, { FC } from 'react'
import { observer } from 'mobx-react'
import { isInShareV2 } from '../../../../util'
import { DetailStore } from '../../stores'
import { ProductItemProps } from '../../stores/receipt_store'
import CommonProductNameCell from '@/pages/sales_invoicing/components/product_name_cell'
import _ from 'lodash'
import Big from 'big.js'

interface Props {
  index: number
  data: ProductItemProps
}

const ProductNameCell: FC<Props> = observer((props) => {
  const { index, data } = props
  const { apportionList } = DetailStore
  const {
    sku_id,
    second_base_unit_ratio,
    input_stock: { input },
  } = data

  const changeProductItem = (changeContent = {}) => {
    const isValidValue = input?.quantity && !_.isNil(input?.quantity)
    const secondInputValue = isValidValue
      ? +Big(+input?.quantity).times(+second_base_unit_ratio!)
      : ''

    DetailStore.changeProductItem(index, {
      ...changeContent,
      // 额外字段处理
      tax_amount: 0,
      sku_unit_id: changeContent?.base_unit_id,
      second_base_unit_quantity: secondInputValue.toString(),
    })
  }

  /** 是否加入了分摊 */
  const isInShare = isInShareV2(apportionList, sku_id)

  return (
    <CommonProductNameCell
      data={data}
      store={DetailStore}
      isInShare={isInShare}
      changeProductItem={changeProductItem}
      keyFields={[
        'sku_id',
        'spu_id',
        'sku_name',
        'input_tax',
        'sku_base_unit_id',
        'sku_base_unit_name',
        'category_id_1',
        'category_name_1',
        'category_id_2',
        'category_name_2',
        'category_id_3',
        'category_name_3',
        'category_name',
        'spu_name',
        'base_unit_id',
        'sku_unit_id',
        'second_base_unit_id',
        'second_base_unit_ratio',
      ]}
    />
  )
})

export default ProductNameCell
