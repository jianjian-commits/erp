import React, { FC } from 'react'
import Big from 'big.js'
import { observer } from 'mobx-react'
import store from '../../stores/detail_store'
import { getLinkCalculateV2 } from '../../../../util'
import { Flex, Price } from '@gm-pc/react'

import { TableXUtil } from '@gm-pc/table-x'
import KCPrecisionInputNumber from '@/common/components/input_number/kc_precision_input_number'
import { checkDigit } from '@/common/util'

const { TABLE_X } = TableXUtil

interface Props {
  data: any
  index: number
}

const MoneyCell: FC<Props> = observer(({ index, data }) => {
  const {
    amount_show,
    amount,
    input_stock: { input },
  } = data
  const { receiptDetail } = store

  const handleMoneyChange = (value: number) => {
    const { base_price } = getLinkCalculateV2({
      data,
      currentField: 'amount',
      currentValue: value,
    })
    store.changeProductDetailsItem(index, {
      amount_show: value,
      amount: value,
      base_price,
      tax_input_price: +Big(value || 0).div(input.quantity || 1),
    })
  }

  const canEdit = !checkDigit(receiptDetail.status, 8)

  return (
    <>
      <Flex alignCenter>
        {canEdit ? (
          <KCPrecisionInputNumber
            precisionType='dpInventoryAmount'
            value={amount_show}
            onChange={handleMoneyChange}
            min={0}
            className='form-control input-sm'
            style={{ width: TABLE_X.WIDTH_NUMBER }}
          />
        ) : (
          amount_show
        )}

        <span className='gm-padding-5'>{Price.getUnit()}</span>
      </Flex>
    </>
  )
})

export default MoneyCell
