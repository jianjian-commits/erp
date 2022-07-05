import React, { FC } from 'react'
import { observer } from 'mobx-react'
import { isInShareV2, getLinkCalculateV2 } from '../../../../util'
import { Flex, Price } from '@gm-pc/react'

import { TableXUtil } from '@gm-pc/table-x'
import KCPrecisionInputNumber from '@/common/components/input_number/kc_precision_input_number'
import { PDetail } from '../../stores/receipt_store1'
import { DetailStore } from '../../stores'

const { TABLE_X } = TableXUtil

interface Props {
  data: PDetail
  index: number
  disabled?: boolean
}

const MoneyCellV2: FC<Props> = observer((props) => {
  const { apportionList, receiptDetail } = DetailStore
  const { index, data, disabled } = props
  const { is_replace } = receiptDetail
  const { tax_amount, sku_id } = data

  const handleMoneyChange = (value: number) => {
    const { tax_input_price } = getLinkCalculateV2({
      data,
      currentField: 'tax_amount',
      currentValue: value,
    })

    DetailStore.changeProductItem(index, {
      tax_amount: value,
      tax_input_price,
    })
  }

  const canEdit = !isInShareV2(apportionList, sku_id) && !is_replace

  return (
    <>
      {!canEdit ? (
        tax_amount + Price.getUnit()
      ) : (
        <Flex alignCenter>
          <KCPrecisionInputNumber
            disabled={disabled}
            precisionType='dpInventoryAmount'
            value={tax_amount ? Number(tax_amount) : null}
            onChange={handleMoneyChange}
            min={0}
            className='form-control input-sm'
            style={{ width: TABLE_X.WIDTH_NUMBER }}
          />
          <span className='gm-padding-5'>{Price.getUnit()}</span>
        </Flex>
      )}
    </>
  )
})

export default MoneyCellV2
