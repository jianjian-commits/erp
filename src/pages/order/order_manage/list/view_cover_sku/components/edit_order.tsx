import React, { FC } from 'react'
import { observer } from 'mobx-react'
import { InputNumber, Flex } from '@gm-pc/react'
import store from '../store'
import { getOrderUnitName } from '../../../../util'
import { InputKey } from '../interface'

const EditOrder: FC<{ index: number; orderKey: InputKey }> = ({
  index,
  orderKey,
}) => {
  const order = store.list[index]
  const orderQuantityVal = order[orderKey]?.quantity?.val!
  // eslint-disable-next-line prefer-const
  let inputVal = orderQuantityVal as string | number | null
  if (!inputVal) {
    inputVal = null
  } else {
    inputVal = +inputVal
  }

  const unitName = getOrderUnitName(order.parentUnit, order.unit!)
  const showValue = orderQuantityVal ? `${orderQuantityVal}${unitName}` : '-'

  const handleEnter = (value: number | null) => {
    store.onChangeSkuData(index, orderKey, {
      price: {
        price: '',
        quantity: '',
        ...order[orderKey]?.price,
        val: '',
        unit_id: order[orderKey]?.quantity?.unit_id || order.unit_id!,
      },
      ...order[orderKey],
      quantity: {
        ...order[orderKey]?.quantity,
        val: value === null ? '' : '' + value,
        unit_id: order[orderKey]?.quantity?.unit_id || order.unit_id!,
        price: '',
        quantity: '',
      },
    })
  }
  if (order.editing) {
    return (
      <Flex alignCenter>
        <InputNumber
          style={{ flex: 1 }}
          min={0}
          max={9999}
          value={inputVal}
          onChange={handleEnter}
        />
        <span>{unitName}</span>
      </Flex>
    )
  }

  return <div>{showValue}</div>
}

export default observer(EditOrder)
