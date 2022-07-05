import React, { FC } from 'react'
import { observer } from 'mobx-react'
import store, { PDetail } from '../../stores/receipt_store'
import { Flex } from '@gm-pc/react'

import { TableXUtil } from '@gm-pc/table-x'
import { checkDigit } from '@/common/util'
import { isSharing } from '@/pages/sales_invoicing/allocation_inventory/util'
import KCPrecisionInputNumber from '@/common/components/input_number/kc_precision_input_number'
import { transferAvaiValue } from '@/pages/sales_invoicing/util'

const { TABLE_X } = TableXUtil

interface Props {
  data: PDetail
  index: number
}

const SsuBaseQuantityCell: FC<Props> = observer(({ index, data }) => {
  const { costAllocations, receiptDetail, updateInputOutStock } = store
  const skuUnits = costAllocations[0]?.sku_units || []
  const {
    sku: { sku_id, sku_base_unit_name },
    input_out_stock,
  } = data

  const { quantity } = input_out_stock?.input
  const handleQuantityChange = (value: number) => {
    updateInputOutStock(index, 'input_out_stock', value)
  }

  const canEdit =
    !isSharing(skuUnits, sku_id) && !checkDigit(receiptDetail.status, 8)

  return (
    <Flex alignCenter>
      {canEdit ? (
        <KCPrecisionInputNumber
          precisionType='salesInvoicing'
          value={transferAvaiValue(quantity)}
          onChange={handleQuantityChange}
          min={0}
          className='form-control input-sm'
          style={{ width: TABLE_X.WIDTH_NUMBER }}
        />
      ) : (
        <span>{quantity}</span>
      )}
      <span className='gm-padding-5'>{sku_base_unit_name || '-'}</span>
    </Flex>
  )
})

export default SsuBaseQuantityCell
