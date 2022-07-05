import React, { FC } from 'react'
import { observer } from 'mobx-react'
// import store, { PDetail } from '../../stores/receipt_store'

import { Flex, Price } from '@gm-pc/react'
import { getLinkCalculateV2 } from '../util'
import { TableXUtil } from '@gm-pc/table-x'
import KCPrecisionInputNumber from '@/common/components/input_number/kc_precision_input_number'
import { toFixed } from '@/common/util'

const { TABLE_X } = TableXUtil

interface Props {
  index: number
  data: any
  disabled?: boolean
  isInShare?: boolean
  store?: any
  changeProductItem: Function
}

const BasePriceCell: FC<Props> = observer((props) => {
  const { data, disabled = false, isInShare, changeProductItem } = props
  const { sku_base_unit_name, tax_input_price } = data
  const handleStdUnitPriceChange = (value: number) => {
    // 单价改变影响金额
    const { tax_amount } = getLinkCalculateV2({
      data,
      currentField: 'tax_input_price',
      currentValue: value,
    })

    changeProductItem({
      tax_input_price: value,
      tax_amount,

      // 老字段
      // base_price_show: value,
      // base_price: value,
      // amount,
      // amount_show,
      // different_price,
    })
  }

  return (
    <>
      {isInShare ? (
        toFixed(tax_input_price, 2) +
        Price.getUnit() +
        '/' +
        (sku_base_unit_name || '-')
      ) : (
        <Flex alignCenter>
          <KCPrecisionInputNumber
            disabled={disabled}
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
      )}
    </>
  )
})

export default BasePriceCell
