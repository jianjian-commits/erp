import React, { FC } from 'react'
import { observer } from 'mobx-react'
import store from '../../stores/detail_store'
import { Flex, Price } from '@gm-pc/react'
import { getLinkCalculateV2 } from '../../../../util'
import { TableXUtil } from '@gm-pc/table-x'
import KCPrecisionInputNumber from '@/common/components/input_number/kc_precision_input_number'
import Big from 'big.js'

const { TABLE_X } = TableXUtil

interface Props {
  index: number
  data: any
}

const SsuBasePriceCell: FC<Props> = observer((props) => {
  const { index, data } = props

  const { sku_base_unit_name, input_stock, tax_input_price } = data

  const handleStdUnitPriceChange = (value: number) => {
    const { amount } = getLinkCalculateV2({
      data,
      currentField: 'base_price',
      currentValue: value,
    })
    store.changeProductDetailsItem(index, {
      amount_show:
        input_stock.input.quantity && value
          ? +Big(value).times(input_stock.input.quantity).toFixed(8)
          : '',
      amount,
      base_price: value,
      tax_input_price: value,
    })
  }
  return (
    <>
      <Flex alignCenter>
        <KCPrecisionInputNumber
          precisionType='dpInventoryAmount'
          value={tax_input_price}
          onChange={handleStdUnitPriceChange}
          min={0}
          className='form-control input-sm'
          style={{ width: TABLE_X.WIDTH_NUMBER }}
        />
        <span className='gm-padding-5'>
          {Price.getUnit() + '/'}
          {sku_base_unit_name || '-'}
        </span>
      </Flex>
    </>
  )
})

export default SsuBasePriceCell
