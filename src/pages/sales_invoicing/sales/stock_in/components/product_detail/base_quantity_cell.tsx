import React, { FC, FocusEventHandler } from 'react'
import { observer } from 'mobx-react'
import store, { PDetail } from '../../stores/list_store'
import { Flex } from '@gm-pc/react'
import { getLinkCalculateV2, transferAvaiValue } from '../../../../util'

import { TableXUtil } from '@gm-pc/table-x'
import Big from 'big.js'
import _ from 'lodash'
import PrecisionInputNumber from '@/common/components/input_number/precision_input_number'

const { TABLE_X } = TableXUtil

interface Props {
  data: PDetail
  index: number
}

const SsuBaseQuantityCell: FC<Props> = observer((props) => {
  const { index, data } = props
  const { isEdit } = store.list[index]
  const {
    input_stock: { input, input2 },
    sku_base_unit_name,
    second_base_unit_quantity,
    second_base_unit_ratio,
  } = data

  const handleQuantityBlur: FocusEventHandler<HTMLInputElement> = (e) => {
    const value = +e.target.value
    /** 辅助单位有值 */
    const isSecondFilled =
      !_.isNil(second_base_unit_quantity) &&
      !!_.toNumber(second_base_unit_quantity)
    const isValidValue = !_.isNil(value)
    const secondInputValue = isValidValue
      ? +Big(value).times(+second_base_unit_ratio)
      : ''

    store.changeDetailItem(index, {
      ...data,
      second_base_unit_quantity: isSecondFilled
        ? second_base_unit_quantity
        : secondInputValue,
    })
  }

  const handleQuantityChange = (value: number) => {
    // 基本单位影响包装单位(废弃)和补差和金额
    const { amount, amount_show } = getLinkCalculateV2({
      data,
      currentField: 'base_quantity',
      currentValue: value,
    })
    // TODO： 暂时不需要进行second_base_unit_ratio换算，后续需要补充
    const secondInputValue = !_.isNil(value) ? Big(value || 0).times(1) : ''
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
    store.changeDetailItem(index, {
      base_quantity_show: value,
      amount,
      amount_show,
    })
  }

  const canEdit = !!isEdit

  return (
    <>
      {!canEdit ? (
        input?.quantity + (sku_base_unit_name || '-')
      ) : (
        <Flex alignCenter>
          <PrecisionInputNumber
            value={transferAvaiValue(input?.quantity!)}
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

export default SsuBaseQuantityCell
