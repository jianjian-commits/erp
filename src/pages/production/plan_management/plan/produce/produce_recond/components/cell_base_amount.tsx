import React, { FC } from 'react'
import { Flex, InputNumber } from '@gm-pc/react'
import { toFixed } from '@/pages/production/util'
import store from '../store'
import { observer } from 'mobx-react'
interface Props {
  process_task_output_log_id: string
}

const CellBaseAmount: FC<Props> = ({ process_task_output_log_id }) => {
  const { baseUnit, base_unit_amount, isEditing } =
    store.getRecond(process_task_output_log_id) || {}
  if (!base_unit_amount && base_unit_amount !== '') return <div />

  const _base_unit_amount =
    base_unit_amount === '' || base_unit_amount === undefined
      ? null
      : parseFloat(base_unit_amount)

  if (!isEditing) {
    return (
      <span>
        {base_unit_amount
          ? `${toFixed(base_unit_amount || '0')}${baseUnit}`
          : '-'}
      </span>
    )
  }
  const handleChange = (value: number | null) => {
    const new_value = value === null ? '' : value + ''
    store.updateListColumn(
      process_task_output_log_id,
      'base_unit_amount',
      new_value,
    )
    store.updateListColumn(process_task_output_log_id, 'amount', new_value)
  }

  return (
    <Flex alignCenter>
      <InputNumber
        style={{ width: '70px' }}
        value={_base_unit_amount}
        min={0}
        onChange={handleChange}
        precision={4}
      />
      {baseUnit}
    </Flex>
  )
}

export default observer(CellBaseAmount)
