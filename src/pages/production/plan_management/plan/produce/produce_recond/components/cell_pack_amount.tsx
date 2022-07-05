import React, { FC } from 'react'
import { Flex, InputNumber } from '@gm-pc/react'
import { toFixed } from '@/pages/production/util'
import store from '../store'
import { observer } from 'mobx-react'
interface Props {
  process_task_output_log_id: string
}

const CellBaseAmount: FC<Props> = ({ process_task_output_log_id }) => {
  const { packUnit, amount, isEditing } =
    store.getRecond(process_task_output_log_id) || {}
  if (!amount && amount !== '') return <div />

  const _amount =
    amount === '' || amount === undefined ? null : parseFloat(amount)

  if (!isEditing) {
    return <span>{amount ? `${toFixed(amount || '0')}${packUnit}` : '-'}</span>
  }
  const handleChange = (value: number | null) => {
    const new_value = value === null ? '' : value + ''
    store.updateListColumn(process_task_output_log_id, 'amount', new_value)
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
      {packUnit}
    </Flex>
  )
}

export default observer(CellBaseAmount)
