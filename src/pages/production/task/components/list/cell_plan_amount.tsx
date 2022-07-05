import React, { FC } from 'react'
import { observer } from 'mobx-react'
import { Flex, InputNumber } from '@gm-pc/react'

import store from '../../store'
import { toFixed } from '../../../util'

interface Props {
  index: number
}

const CellPlanAmount: FC<Props> = observer(({ index }) => {
  const task = store.taskList[index]
  const { plan_amount, isEditing, unit_name } = task

  const _amount =
    plan_amount === '' || plan_amount === undefined
      ? null
      : parseFloat(plan_amount)

  if (!isEditing) {
    return (
      <span>
        {plan_amount ? `${toFixed(plan_amount || '0')}${unit_name}` : '-'}
      </span>
    )
  }

  const handleChange = (value: number | null) => {
    const new_value = value === null ? '' : value + ''
    store.updateListColumn(index, 'plan_amount', new_value)
  }

  return (
    <Flex alignCenter>
      <InputNumber
        style={{ width: '70px' }}
        value={_amount}
        min={0}
        onChange={handleChange}
        precision={4}
      />
      {unit_name}
    </Flex>
  )
})

export default CellPlanAmount
