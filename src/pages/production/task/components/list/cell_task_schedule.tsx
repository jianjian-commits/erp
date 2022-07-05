import { Flex, ProgressCircle } from '@gm-pc/react'
import Big from 'big.js'
import { observer } from 'mobx-react'
import React, { FC } from 'react'
import { toFixed } from '../../../util'
import store from '../../store'

interface Props {
  index: number
}

const CellTaskSchedule: FC<Props> = observer(({ index }) => {
  const original = store.taskList[index]

  const { output_amount, plan_amount, unit_name } = original
  let percentage = '0'
  if (output_amount !== '' && plan_amount !== '') {
    percentage = Big(+output_amount || 0)
      .div(+plan_amount || 1)
      .times(100)
      .toFixed(2)
  }

  const renderText = () => {
    return (
      <span>
        {output_amount ? `${toFixed(output_amount || '0')}${unit_name}` : '-'}/
        {plan_amount ? `${toFixed(plan_amount || '0')}${unit_name}` : '-'}
      </span>
    )
  }

  // 展示进度图及(已完成/计划数)
  return (
    <Flex alignCenter>
      <ProgressCircle
        percentage={parseFloat(percentage)}
        className='gm-margin-right-5'
      />
      {renderText()}
    </Flex>
  )
})

export default CellTaskSchedule
