import React, { FC } from 'react'
import { observer } from 'mobx-react'
import Big from 'big.js'
import { Flex } from '@gm-pc/react'
import store, { PDetail } from '../../stores/receipt_store1'
import { toFixed, checkDigit } from '@/common/util'
import { isInShareV2 } from '../../../../util'
import { DetailStore } from '../../stores'

import KCPrecisionInputNumber from '@/common/components/input_number/kc_precision_input_number'

interface Props {
  index: number
  data: PDetail
  disabled?: boolean
}
const TaxRateCell: FC<Props> = (props) => {
  const { apportionList, receiptDetail } = DetailStore
  const { index, data, disabled = false } = props
  const { sku_id, input_tax } = data

  const canEdit =
    !isInShareV2(apportionList, sku_id) &&
    !checkDigit(receiptDetail.is_replace, 8)

  const handleChange = (value: number) => {
    DetailStore.changeProductItem(index, {
      input_tax: value,
    })
  }

  if (!canEdit) {
    return <Flex alignCenter>{toFixed(Big(input_tax || 0), 2) + '%'}</Flex>
  }

  return (
    <Flex alignCenter>
      <KCPrecisionInputNumber
        disabled={disabled}
        value={input_tax!}
        onChange={handleChange}
        min={0}
        precision={0}
        style={{ width: '85px' }}
        className='input-sm'
      />
      <span style={{ wordBreak: 'normal' }}>%</span>
    </Flex>
  )
}

export default observer(TaxRateCell)
