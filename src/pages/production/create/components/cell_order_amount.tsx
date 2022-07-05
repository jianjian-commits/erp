import React, { FC } from 'react'
import { Flex, InputNumber } from '@gm-pc/react'
import { observer } from 'mobx-react'
import Big from 'big.js'

import store from '../store'
import globalStore from '@/stores/global'

interface Props {
  index: number
}

const CellOrderAmount: FC<Props> = observer(({ index }) => {
  const original = store.taskInfo.product_details![index]

  const { order_amount, bomInfo, units } = original

  // unitName 需要从拿对应的sku_id，然后去boms里面找到对应的项
  const unitName = () => {
    if (bomInfo) {
      if (bomInfo.base_unit_id < 200000) {
        const unit = units.units.filter(
          (item) => item.unit_id === bomInfo.base_unit_id,
        )
        return unit[0].name
      } else {
        return globalStore.getUnitName(bomInfo.base_unit_id)
      }
    } else return ''
  }

  const _amount =
    order_amount === '' || order_amount === undefined
      ? null
      : parseFloat(order_amount)

  const handleChange = (value: number | null) => {
    const amount = value === null ? '' : Big(value).toFixed(2)
    store.updateListItem(index, {
      ...original,
      // unit_id: boms[sku_id].base_unit_id,
      order_amount: amount,
    })
  }

  return (
    <Flex alignCenter justifyCenter style={{ minWidth: '150px' }}>
      <InputNumber
        style={{ width: '80px' }}
        min={0}
        value={_amount}
        onChange={handleChange}
      />
      {unitName()}
    </Flex>
  )
})

export default CellOrderAmount
