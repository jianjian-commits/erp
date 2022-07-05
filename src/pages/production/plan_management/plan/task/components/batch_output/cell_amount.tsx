import React, { FC } from 'react'
import { Observer } from 'mobx-react'
import { Flex, InputNumber } from '@gm-pc/react'
import Big from 'big.js'

import CellFull from '@/pages/production/components/table_cell_full'
import store from '@/pages/production/plan_management/plan/task/store'

interface Props {
  index: number
  isBaseUnit: boolean
}

const CellAmount: FC<Props> = ({ index, isBaseUnit }) => {
  const sku = store.OutputTaskList[index].sku
  const field = isBaseUnit ? 'pack_base_output_amount' : 'pack_output_amount'

  const handleAmountChange = (
    tIndex: number,
    value: number | null,
    bIndex: number,
  ) => {
    const new_value = value === null ? '' : Big(value).toFixed(4)
    store.updateOutputTaskItem(tIndex, new_value, bIndex, field)
  }

  /**
   * 产出数 = 默认计划生产数 - 已产出数
   * 若产出数计算后小于0，默认展示0，且限制只能填写大于0的数
   */
  return (
    <Observer>
      {() => (
        <CellFull
          list={sku}
          renderItem={(v, i: number) => {
            if (!isBaseUnit && i > 0) return '-'
            const amount =
              v[field] === ''
                ? null
                : parseFloat(v[field]) < 0
                ? 0
                : parseFloat(v[field])
            return (
              <Flex alignCenter>
                <InputNumber
                  style={{ width: '60px' }}
                  min={0}
                  value={amount}
                  onChange={(value) => handleAmountChange(index, value, i)}
                  precision={4}
                />
                {isBaseUnit ? v.pack_base_unit_name : v.pack_unit_name}
              </Flex>
            )
          }}
        />
      )}
    </Observer>
  )
}

export default CellAmount
