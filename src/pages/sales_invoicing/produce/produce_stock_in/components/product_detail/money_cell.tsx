import React, { FC } from 'react'
import { observer } from 'mobx-react'
import { isInShareV2, getLinkCalculateV2 } from '../../../../util'
import store, { PDetail } from '../../stores/receipt_store'
import { Flex, Price } from '@gm-pc/react'

import { TableXUtil } from '@gm-pc/table-x'
import KCPrecisionInputNumber from '@/common/components/input_number/kc_precision_input_number'
import { checkDigit } from '@/common/util'
import _ from 'lodash'

const { TABLE_X } = TableXUtil

interface Props {
  data: PDetail
  index: number
}

const MoneyCell: FC<Props> = observer((props) => {
  const { apportionList, receiptDetail } = store
  const { index, data } = props
  const {
    amount,
    sku_id,
    input_stock: { input, input2 },
  } = data

  const handleMoneyChange = (value: number) => {
    const { base_quantity, base_price } = getLinkCalculateV2({
      data,
      currentField: 'amount',
      currentValue: value,
    })
    _.set(data, 'input_stock', {
      input: {
        ...input,
        quantity: base_quantity,
      },
      input2: {
        ...input2,
        quantity: base_quantity,
      },
    })
    store.changeProductDetailsItem(index, {
      base_quantity,
      base_price,
      amount: value,
    })
  }

  // const amount_show = +toFixedByType(+amount || 0, 'dpInventoryAmount')
  const canEdit =
    !isInShareV2(apportionList, sku_id) && !checkDigit(receiptDetail.status, 8)

  return (
    <>
      {!canEdit ? (
        amount + Price.getUnit()
      ) : (
        <Flex alignCenter>
          <KCPrecisionInputNumber
            precisionType='dpInventoryAmount'
            value={amount}
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

export default MoneyCell
