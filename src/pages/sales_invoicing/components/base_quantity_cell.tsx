import React, { FC, FocusEventHandler } from 'react'
import Big from 'big.js'
import _ from 'lodash'
import { observer } from 'mobx-react'
import { Flex } from '@gm-pc/react'
import { getLinkCalculateV2 } from '../util'

import { TableXUtil } from '@gm-pc/table-x'
import KCPrecisionInputNumber from '@/common/components/input_number/kc_precision_input_number'
import { toFixedSalesInvoicing } from '@/common/util'
import globalStore from '@/stores/global'

const { TABLE_X } = TableXUtil

interface Props {
  data: any
  index: number
  keyField?: 'input_stock' | 'input_in_stock' | 'input_out_stock'
  is_replace?: boolean
  isInShare?: boolean // 有分摊则传
  changeProductItem: Function
}

const BaseQuantityCell: FC<Props> = observer((props) => {
  const {
    data,
    changeProductItem,
    isInShare = undefined,
    keyField = 'input_stock',
  } = props
  const {
    sku_base_unit_id,
    sku_base_unit_name,
    stock,
    second_base_unit_ratio,
    second_base_unit_quantity,
  } = data
  // 调拨申请是input_in_stock
  const input_stock = data?.[keyField]
  const input = input_stock?.input
  const input2 = input_stock?.input2

  const handleQuantityBlur: FocusEventHandler<HTMLInputElement> = (e) => {
    const value = +e.target.value
    /** 辅助单位有值 */
    const isSecondFilled =
      !_.isNil(second_base_unit_quantity) &&
      !!_.toNumber(second_base_unit_quantity)
    const isValidValue = !_.isNil(value)
    const secondInputValue = isValidValue
      ? +Big(value).div(+second_base_unit_ratio || 1)
      : ''

    changeProductItem({
      ...data,
      second_base_unit_quantity: isSecondFilled
        ? second_base_unit_quantity.toString()
        : secondInputValue.toString(),
    })
  }

  const handleQuantityChange = (value: number) => {
    // 基本单位影响包装单位(废弃)和补差和金额
    const { amount } = getLinkCalculateV2({
      data,
      currentField: 'base_quantity',
      currentValue: value,
    })
    const isValidValue = !_.isNil(value)
    const secondInputValue = isValidValue
      ? +Big(+value).times(+second_base_unit_ratio)
      : ''

    _.set(data, keyField, {
      input: {
        ...input,
        unit_id: sku_base_unit_id,
        quantity: isValidValue ? value.toString() : '',
      },
      input2: {
        ...input2,
        unit_id: sku_base_unit_id,
        quantity: secondInputValue.toString(),
      },
    })
    changeProductItem({
      ...data,
      amount,
      tax_amount: amount,
      batch_selected: [],
    })
  }

  const canEdit = isInShare !== undefined && !isInShare && !props?.is_replace

  return (
    <>
      {!canEdit ? (
        (globalStore.isLite
          ? stock?.base_unit?.quantity
          : toFixedSalesInvoicing(input?.quantity)) +
        (sku_base_unit_name || '-')
      ) : (
        <Flex alignCenter>
          <KCPrecisionInputNumber
            value={input?.quantity ? Number(input?.quantity) : null}
            onBlur={handleQuantityBlur}
            onChange={handleQuantityChange}
            min={0}
            precisionType='salesInvoicing'
            className='form-control input-sm'
            style={{ width: TABLE_X.WIDTH_NUMBER }}
          />
          <span className='gm-padding-5'>{sku_base_unit_name || '-'}</span>
        </Flex>
      )}
    </>
  )
})

export default BaseQuantityCell
