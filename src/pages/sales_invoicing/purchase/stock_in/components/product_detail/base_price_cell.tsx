import React, { FC } from 'react'
import { observer } from 'mobx-react'
import { isInShareV2 } from '../../../../util'
import CommonBasePriceCell from '@/pages/sales_invoicing/components/base_price_cell'
import store, { PDetail } from '../../stores/receipt_store1'
import { DetailStore } from '../../stores'

interface Props {
  index: number
  data: PDetail
  disabled?: boolean
}

const BasePriceCell: FC<Props> = observer((props) => {
  const { index, data } = props
  const { apportionList } = DetailStore

  const { sku_id } = data

  const changeProductItem = (changeContent = {}) => {
    DetailStore.changeProductItem(index, {
      ...changeContent,
      // 特殊值处理
      // ...
    })
  }

  /** 是否加入了分摊 */
  const isInShare = isInShareV2(apportionList, sku_id)

  return (
    <CommonBasePriceCell
      index={index}
      data={data}
      isInShare={isInShare}
      changeProductItem={changeProductItem}
    />
  )
})

export default BasePriceCell
