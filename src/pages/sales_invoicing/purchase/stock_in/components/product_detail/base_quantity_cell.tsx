import React, { FC } from 'react'
import { observer } from 'mobx-react'
import { isInShareV2 } from '../../../../util'
import { CommonBaseaQuantityCell } from '@/pages/sales_invoicing/components'
import { PDetail } from '../../stores/receipt_store1'
import { DetailStore } from '../../stores'
interface Props {
  data: PDetail
  index: number
}

/**
 * @deprecated 目前已经没有地方用到，暂且保留，下个迭代删除
 */
const BaseQuantityCell: FC<Props> = observer((props) => {
  const { index, data } = props
  const {
    apportionList,
    receiptDetail: { is_replace },
  } = DetailStore
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
    <CommonBaseaQuantityCell
      index={index}
      data={data}
      is_replace={is_replace}
      isInShare={isInShare}
      changeProductItem={changeProductItem}
    />
  )
})

export default BaseQuantityCell
