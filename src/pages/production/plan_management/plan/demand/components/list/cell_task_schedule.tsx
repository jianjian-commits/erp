import { Flex } from '@gm-pc/react'

import React, { FC } from 'react'
import store from '../../store'
import { observer } from 'mobx-react'
import { Progress } from 'antd'
import Big from 'big.js'
import { toFixed } from '@/common/util'

interface Props {
  taskId: string
}

const CellTaskSchedule: FC<Props> = ({ taskId }) => {
  const { output_amount, plan_amount } = store.taskDetails?.[taskId] || {}
  if (!plan_amount && plan_amount !== '') return <div />
  // 展示进度图及(已完成/计划数)
  return (
    <Flex alignCenter justifyCenter>
      <Progress
        style={{ width: '80%' }}
        percent={Big(+output_amount! || 0)
          .div(+plan_amount! || '1')
          .times(100)
          .toNumber()}
        format={(percent) => (
          <div className='gm-text-12'>{toFixed(percent!, 2) + '%'}</div>
        )}
      />
    </Flex>
  )
}

export default observer(CellTaskSchedule)
