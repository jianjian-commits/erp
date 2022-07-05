import React, { FC } from 'react'
import Big from 'big.js'
import { observer } from 'mobx-react'
import store, { PDetail } from '../../stores/receipt_store'
import { Flex } from '@gm-pc/react'

import { TableXUtil } from '@gm-pc/table-x'
import KCPrecisionInputNumber from '@/common/components/input_number/kc_precision_input_number'
import _ from 'lodash'

const { TABLE_X } = TableXUtil

interface Props {
  data: PDetail
  index: number
}

const SsuBaseQuantityCell: FC<Props> = observer((props) => {
  const { data, index } = props
  const { sku_base_unit_name, input_stock, sku_unit_rate } = data
  const { productDetails, canEdit } = store

  const handleQuantityChange = (value: number) => {
    const productDetail = productDetails[index]
    const { input, input2 } = productDetail.input_stock

    const secondInputValue = value
      ? Big(value).times(Number(sku_unit_rate))
      : ''
    _.set(productDetail, 'input_stock', {
      input: {
        ...input,
        quantity: value ? value.toString() : '',
      },
      input2: {
        ...input2,
        quantity: secondInputValue.toString(),
      },
    })
    store.changeDetailItem(index, productDetail)
  }

  const quantity = input_stock.input?.quantity

  return (
    <>
      <Flex alignCenter>
        {canEdit ? (
          <KCPrecisionInputNumber
            value={quantity ? Number(quantity) : null}
            onChange={handleQuantityChange}
            min={0}
            precisionType='salesInvoicing'
            className='form-control input-sm'
            style={{ width: TABLE_X.WIDTH_NUMBER }}
          />
        ) : (
          <>
            {input_stock.input?.quantity
              ? parseFloat(input_stock.input?.quantity)
              : ''}
          </>
        )}
        <span className='gm-padding-5'>{sku_base_unit_name || '-'}</span>
      </Flex>
    </>
  )
})

export default SsuBaseQuantityCell
