import React, { FC } from 'react'
import { observer } from 'mobx-react'
import { isInShare } from '../../../../util'
import store, { PDetail } from '../../stores/receipt_store'
import { Flex } from '@gm-pc/react'

import { TableXUtil } from '@gm-pc/table-x'
import KCPrecisionInputNumber from '@/common/components/input_number/kc_precision_input_number'
import { checkDigit } from '@/common/util'

const { TABLE_X } = TableXUtil

interface Props {
  index: number
  data: PDetail
}

/**
 * @deprecated 商品重构仅有基本单位，组件弃用
 */
const SsuQuantityCell: FC<Props> = observer((props) => {
  const { index } = props
  const {
    costAllocations,
    receiptDetail,
    productDetailsShow,
    updateInputOutStock,
    input_out_stocks,
  } = store
  const {
    ssu: { ssu_unit_id, ssu_unit_name },
    sku: { sku_id },
  } = productDetailsShow[index]
  const input_out_stock = input_out_stocks[index]
  const { quantity } = input_out_stock?.input2

  const handleQuantityChange = (value: number | null) => {
    updateInputOutStock(index, 'input2.quantity', value)
  }

  const canEdit =
    !isInShare(costAllocations, sku_id, ssu_unit_id) &&
    !checkDigit(receiptDetail.status, 8)

  return (
    <>
      {!canEdit ? (
        `${quantity}${ssu_unit_name}`
      ) : (
        <Flex alignCenter>
          <KCPrecisionInputNumber
            precisionType='salesInvoicing'
            value={quantity}
            onChange={handleQuantityChange}
            min={0}
            className='form-control input-sm'
            style={{ width: TABLE_X.WIDTH_NUMBER }}
          />
          <span className='gm-padding-5'>{ssu_unit_name || '-'}</span>
        </Flex>
      )}
    </>
  )
})

export default SsuQuantityCell
