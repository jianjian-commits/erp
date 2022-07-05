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
    second_base_unit_id,
    // second_base_unit_name,
    stock,
    second_base_unit_ratio,
    second_base_unit_quantity,
  } = data
  // 调拨申请是input_in_stock
  const input_stock = data?.[keyField]
  const input = input_stock?.input
  const input2 = input_stock?.input2
  const second_base_unit_name = globalStore.getUnitName(second_base_unit_id)

  /** 失焦进行换算联动 */
  const handleQuantityBlur: FocusEventHandler<HTMLInputElement> = (e) => {
    const value = +e.target.value
    /** 基本单位有值 */
    const isInputQuantityFilled = !input?.quantity
    const isValidValue = !_.isNil(value)
    const baseQuantity = isValidValue
      ? +Big(value).times(+second_base_unit_ratio || 1)
      : ''
    // 基本单位影响包装单位(废弃)和补差和金额
    const { amount } = getLinkCalculateV2({
      data,
      currentField: 'base_quantity',
      currentValue: +baseQuantity,
    })

    // 基本单位有值，则不进行换算
    isInputQuantityFilled &&
      _.set(data, keyField, {
        input: {
          ...input,
          unit_id: sku_base_unit_id,
          quantity: isValidValue ? baseQuantity.toString() : '',
        },
        input2: {
          ...input2,
          unit_id: sku_base_unit_id,
          quantity: baseQuantity.toString(),
        },
      })

    changeProductItem({
      ...data,
      tax_amount: amount,
    })
  }

  const handleQuantityChange = (value: number) => {
    changeProductItem({
      second_base_unit_quantity: value == null ? null : value.toString(),
    })
  }

  const canEdit = isInShare !== undefined && !isInShare && !props?.is_replace

  return (
    <>
      {!canEdit ? (
        (globalStore.isLite
          ? stock?.base_unit?.quantity
          : toFixedSalesInvoicing(second_base_unit_quantity)) +
        (second_base_unit_name || '-')
      ) : second_base_unit_name ? (
        <Flex alignCenter>
          <KCPrecisionInputNumber
            value={
              second_base_unit_quantity
                ? Number(second_base_unit_quantity)
                : null
            }
            onBlur={handleQuantityBlur}
            onChange={handleQuantityChange}
            min={0}
            precisionType='salesInvoicing'
            className='form-control input-sm'
            style={{ width: TABLE_X.WIDTH_NUMBER }}
          />
          <span className='gm-padding-5'>{second_base_unit_name}</span>
        </Flex>
      ) : (
        '-'
      )}
    </>
  )
})

export default BaseQuantityCell
