import React, { FC } from 'react'
import { observer } from 'mobx-react'
import { Flex, InputNumber } from '@gm-pc/react'
import Big from 'big.js'
import _ from 'lodash'
import { AfterSaleOrderDetail_TaskMethod } from 'gm_api/src/aftersale'
import store from '../../store'

interface Props {
  index: number
}

const PickUpAmountCell: FC<Props> = observer(({ index }) => {
  const {
    isEditing,
    task_method,
    real_return_value,
    apply_return_value,
    ssu_base_unit_name,
  } = store.list[index]
  // real_return_value 为空则取apply_return_value里面的值展示
  const pick_quantity =
    Object.keys(real_return_value!).length === 0 ||
    real_return_value?.input?.quantity! === ''
      ? null
      : parseFloat(real_return_value?.input?.quantity!)

  const default_quantity =
    Object.keys(apply_return_value!).length === 0 ||
    apply_return_value?.input?.quantity! === ''
      ? null
      : parseFloat(apply_return_value?.input?.quantity!)

  // 详情展示取货数  详情展示取货数  task_method 0为未知，1为取货，2为放弃取货
  if (
    !isEditing ||
    task_method === AfterSaleOrderDetail_TaskMethod.TASK_METHOD_GIVE_UP_PICKUP
  ) {
    return (
      <span>
        {Object.keys(real_return_value!).length > 0
          ? task_method ===
            AfterSaleOrderDetail_TaskMethod.TASK_METHOD_GIVE_UP_PICKUP
            ? `${Big(Number(0)).toFixed(2)} ${ssu_base_unit_name}` // 放弃取货，取货数设置为0
            : `${Big(Number(pick_quantity)).toFixed(2)} ${ssu_base_unit_name}`
          : `${Big(Number(apply_return_value?.calculate?.quantity!)).toFixed(
              2,
            )} ${ssu_base_unit_name}`}
      </span>
    )
  }

  const handleChange = (value: number | null) => {
    const new_value = value === null ? '' : value + ''

    const _real_return_value = Object.assign({}, real_return_value)
    _.set(_real_return_value, 'input.quantity', new_value)
    _.set(
      _real_return_value,
      'input.price',
      apply_return_value?.calculate?.price! || '0',
    )
    _.set(
      _real_return_value,
      'input.unit_id',
      apply_return_value?.calculate?.unit_id! || '100000',
    )
    _.set(_real_return_value, 'calculate.quantity', new_value)
    _.set(
      _real_return_value,
      'calculate.price',
      apply_return_value?.calculate?.price! || '0',
    )
    _.set(
      _real_return_value,
      'calculate.unit_id',
      apply_return_value?.calculate?.unit_id! || '100000',
    )

    store.updateListColumn(index, 'real_return_value', _real_return_value)
  }
  return (
    <Flex alignCenter justifyStart>
      <InputNumber
        style={{ width: '70px' }}
        value={
          Object.keys(real_return_value!).length > 0
            ? pick_quantity
            : default_quantity
        }
        min={0}
        max={Number(apply_return_value?.calculate?.quantity!)}
        onChange={handleChange}
      />
      <div className='gm-margin-left-5'>{ssu_base_unit_name}</div>
    </Flex>
  )
})

export default PickUpAmountCell
