import React, { FC } from 'react'
import { Flex, InputNumber } from '@gm-pc/react'
import { toFixed } from '@/pages/production/util'
import store from '../../store'
import { observer } from 'mobx-react'
interface Props {
  taskId: string
}

const CellPlanAmount: FC<Props> = ({ taskId }) => {
  const { plan_amount, isEditing, unit_name } =
    store.taskDetails?.[taskId] || {}
  if (!plan_amount && plan_amount !== '') return <div />

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
    store.updateListColumn(taskId, 'plan_amount', new_value)
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
}

export default observer(CellPlanAmount)
