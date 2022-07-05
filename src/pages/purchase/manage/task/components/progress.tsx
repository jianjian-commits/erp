import React from 'react'
import { ProgressCircle, Flex } from '@gm-pc/react'
import { observer } from 'mobx-react'
import Big from 'big.js'
import store from '../store'
import { toFixed } from '@/common/util'
import { getBaseUnitName } from '../../../util'
import globalStore from '@/stores/global'
const Progress = (props: { index: number }) => {
  const task = store.list[props.index]
  const { unit_name, rate } = task
  const percentage = +toFixed(
    Big(task.purchase_value?.input?.quantity || 0)
      .div(+task.plan_value?.input?.quantity! || 1)
      .times(100),
  )

  return (
    <Flex alignCenter>
      <ProgressCircle
        percentage={percentage > 100 ? 100 : percentage}
        size={35}
      />
      (
      {toFixed(Big(+task.purchase_value?.input?.quantity! || 0).div(+rate)) +
        unit_name}
      /
      {(task.plan_value?.input?.quantity!
        ? toFixed(Big(+task.plan_value?.input?.quantity! || 0).div(+rate))
        : '-') + unit_name}
      )
    </Flex>
  )
}

export default observer(Progress)
