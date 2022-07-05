import React, { FC } from 'react'

import store from '../store'
import globalStore from '@/stores/global'
import { observer } from 'mobx-react'
import { toFixed } from '@/common/util'
import Big from 'big.js'

const BaseStock: FC<{ index: number }> = (props) => {
  const task = store.list[props.index]

  const { base_stock } = task
  const unit_name = globalStore.getUnitName(base_stock?.base_unit?.unit_id!)

  return (
    <>
      {base_stock?.base_unit?.quantity
        ? toFixed(Big(base_stock?.base_unit?.quantity)) + unit_name
        : '-'}
    </>
  )
}

export default observer(BaseStock)
