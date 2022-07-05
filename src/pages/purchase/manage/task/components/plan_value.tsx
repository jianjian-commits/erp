import React, { FC } from 'react'
import _ from 'lodash'
import { Flex } from '@gm-pc/react'

import store from '../store'
import globalStore from '@/stores/global'
import type { Task } from '../store'
import { PurchaseTask_Status } from 'gm_api/src/purchase'
import { observer } from 'mobx-react'
import { toFixed } from '@/common/util'
import Big from 'big.js'
import PrecisionInputNumber from '@/common/components/input_number/precision_input_number'
import { t } from 'gm-i18n'

interface PlanValueProps {
  index: number
  disabled?: boolean
}
const PlanValue: FC<PlanValueProps> = (props) => {
  const task = store.list[props.index]
  function handleChange<T extends keyof Task>(
    index: number,
    key: T,
    value: Task[T],
  ) {
    store.rowUpdate(index, key, value)
  }

  const { plan_value, isEditing, status, request_value, rate, unit_name } = task

  if (isEditing && status < PurchaseTask_Status.RELEASED) {
    return (
      <Flex alignCenter>
        <PrecisionInputNumber
          disabled={props.disabled}
          style={{ minWidth: 60 }}
          value={
            !_.isNaN(+plan_value?.input?.quantity!)
              ? Number(toFixed(Big(plan_value?.input?.quantity!).div(+rate)))
              : null
          }
          min={0}
          onChange={(value) => {
            if (_.isNil(value)) {
              handleChange(props.index, 'plan_value', {})
            } else {
              handleChange(props.index, 'plan_value', {
                ...plan_value,
                input: {
                  unit_id: request_value?.input?.unit_id!,
                  ...plan_value?.input,
                  quantity: '' + Big(value).times(+rate),
                },
                calculate: {
                  unit_id: request_value?.calculate?.unit_id!,
                  ...plan_value?.calculate,
                  quantity: '' + Big(value).times(+rate),
                },
              })
            }
          }}
        />
        <span>{unit_name}</span>
      </Flex>
    )
  }
  return (
    <>
      {(+plan_value?.input?.quantity! || 0) <= 0
        ? t('库存充足')
        : toFixed(Big(+plan_value?.input?.quantity! || 0).div(+rate)) +
          unit_name}
    </>
  )
}

export default observer(PlanValue)
