import React, { FC, FocusEventHandler } from 'react'
import { observer } from 'mobx-react'
import store, { PDetail } from '../../stores/list_store'
import { Flex } from '@gm-pc/react'
import { getLinkCalculateV2, transferAvaiValue } from '../../../../util'
import { getUnNillText } from '@/common/util'

import { TableXUtil } from '@gm-pc/table-x'
import Big from 'big.js'
import _ from 'lodash'
import PrecisionInputNumber from '@/common/components/input_number/precision_input_number'
import globalStore from '@/stores/global'

const { TABLE_X } = TableXUtil

interface Props {
  data: PDetail
  index: number
}

const BaseQuantitySecondCell: FC<Props> = observer((props) => {
  const { index, data } = props
  const { isEdit } = store.list[index]
  const {
    sku_base_unit_id,
    second_base_unit_ratio,
    second_base_unit_id,
    second_base_unit_quantity,
    input_stock: { input, input2 },
  } = data
  const second_base_unit_name = globalStore.getUnitName(second_base_unit_id)

  /** 失焦进行换算联动 */
  const handleQuantityBlur: FocusEventHandler<HTMLInputElement> = (e) => {
    const value = +e.target.value
    /** 基本单位有值 */
    const isInputQuantityFilled = !input?.quantity
    const isValidValue = !_.isNil(value)
    const baseQuantity = isValidValue
      ? +Big(value).div(+second_base_unit_ratio || 1)
      : ''
    // 基本单位影响包装单位(废弃)和补差和金额
    const { amount } = getLinkCalculateV2({
      data,
      currentField: 'base_quantity',
      currentValue: +baseQuantity,
    })

    // 基本单位有值，则不进行换算
    isInputQuantityFilled &&
      _.set(data, 'input_stock', {
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

    store.changeDetailItem(index, {
      ...data,
      base_quantity_show: value,
      amount,
    })
  }

  const handleQuantityChange = (value: number) => {
    store.changeDetailItem(index, {
      second_base_unit_quantity: value,
    })
  }

  const canEdit = !!isEdit
  console.log(second_base_unit_quantity, 'second_base_unit_quantity')
  return (
    <>
      {!canEdit ? (
        getUnNillText(second_base_unit_quantity) +
        (second_base_unit_name || '-')
      ) : (
        <Flex alignCenter>
          <PrecisionInputNumber
            value={transferAvaiValue(second_base_unit_quantity!)}
            onBlur={handleQuantityBlur}
            onChange={handleQuantityChange}
            min={0}
            precisionType='salesInvoicing'
            className='form-control input-sm'
            style={{ width: TABLE_X.WIDTH_NUMBER }}
          />
          <span className='gm-padding-5'>{second_base_unit_name || '-'}</span>
        </Flex>
      )}
    </>
  )
})

export default BaseQuantitySecondCell
