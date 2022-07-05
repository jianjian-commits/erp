import React, { FC } from 'react'
import Big from 'big.js'
import store from '../store'
import { observer } from 'mobx-react'
import { toFixed } from '@/common/util'
import KCPrecisionInputNumber from '@/common/components/input_number/kc_precision_input_number'

interface PurchaseInputProps {
  index: number
}
const PurchaseInput: FC<PurchaseInputProps> = ({ index }) => {
  const v = store.specDetail.list[index]
  function handleChange(value: number) {
    if (value === null) {
      store.updateListColumn(index, 'plan_purchase_amount', null)
      return
    }
    // 因为是采购单位
    const rate = 1
    store.updateListColumn(
      index,
      'plan_purchase_amount',
      +toFixed(Big(value || 0).div(rate || 1)),
    )
  }
  return (
    <KCPrecisionInputNumber
      style={{ width: 100 }}
      value={(v.plan_purchase_amount as number) ?? null}
      onChange={handleChange}
    />
  )
}

export default observer(PurchaseInput)
