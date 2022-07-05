import React, { FC } from 'react'
import Big from 'big.js'
import _ from 'lodash'
import { observer } from 'mobx-react'
import store from '../../stores/detail_store'
import { Flex } from '@gm-pc/react'
import { getLinkCalculateV2, transferAvaiValue } from '../../../../util'

import { TableXUtil } from '@gm-pc/table-x'
import KCPrecisionInputNumber from '@/common/components/input_number/kc_precision_input_number'
import { checkDigit } from '@/common/util'
import { toJS } from 'mobx'

const { TABLE_X } = TableXUtil

interface Props {
  data: any
  index: number
}

const SsuBaseQuantityCell: FC<Props> = observer((props) => {
  const { index, data } = props
  const {
    sku_base_unit_name,
    input_stock: { input, input2 },
    tax_input_price,
  } = data

  console.log(toJS(data), 'data...')

  const { receiptDetail } = store

  const handleQuantityChange = (value: number) => {
    const { amount } = getLinkCalculateV2({
      data,
      currentField: 'base_quantity',
      currentValue: value,
    })

    // TODO： 暂时不需要进行second_base_unit_ratio换算，后续需要补充
    const secondInputValue = !_.isNil(value) ? Big(value).times(1) : ''
    _.set(data, 'input_stock', {
      input: {
        ...input,
        quantity: !_.isNil(value) ? value.toString() : '',
      },
      input2: {
        ...input2,
        quantity: secondInputValue.toString(),
      },
    })
    store.changeProductDetailsItem(index, {
      amount_show:
        tax_input_price && value
          ? +Big(tax_input_price).times(value).toFixed(8)
          : '',
      amount,
    })
  }

  const canEdit = !checkDigit(receiptDetail.status, 8)

  return (
    <>
      <Flex alignCenter>
        {canEdit ? (
          <KCPrecisionInputNumber
            value={transferAvaiValue(input?.quantity)}
            onChange={handleQuantityChange}
            min={0}
            precisionType='salesInvoicing'
            className='form-control input-sm'
            style={{ width: TABLE_X.WIDTH_NUMBER }}
          />
        ) : (
          input?.quantity
        )}

        <span className='gm-padding-5'>{sku_base_unit_name || '-'}</span>
      </Flex>
    </>
  )
})

export default SsuBaseQuantityCell
