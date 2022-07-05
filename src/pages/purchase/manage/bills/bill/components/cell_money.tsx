import React, { FC, useEffect } from 'react'
import _ from 'lodash'
import { observer } from 'mobx-react'
import Big from 'big.js'
import { Flex, Price } from '@gm-pc/react'
import store from '../store'
import { PurchaseSheet_Status } from 'gm_api/src/purchase'
import { toFixed } from '@/common/util'
import KCPrecisionInputNumber from '@/common/components/input_number/kc_precision_input_number'

interface CellMoneyProps {
  index: number
  disabled?: boolean
}
const CellMoney: FC<CellMoneyProps> = (props) => {
  const { index, disabled } = props
  const { status } = store.info
  // _amount_edit_filed
  const { purchase_money } = store.list[index]
  const isCommitted = status === (PurchaseSheet_Status.COMMIT as number)

  const handleChange = (value: number) => {
    const amount = store.list[index].purchase_amount
    store.updateRowColumn(index, 'purchase_money', value)
    // 同步采购单价
    store.updateRowColumn(
      index,
      'purchase_price',
      value && amount && +toFixed(Big(value).div(amount)),
    )
  }

  useEffect(() => {
    if (disabled && !isCommitted && !purchase_money) {
      handleChange(0)
    }
  }, [])

  const price =
    purchase_money === null ? null : Big(purchase_money || 0).toFixed(2)

  if (isCommitted) return <Flex alignCenter>{price + Price.getUnit()}</Flex>

  return (
    <Flex alignCenter>
      <KCPrecisionInputNumber
        disabled={disabled}
        value={price === null ? null : +price}
        onChange={handleChange}
        min={0}
        precisionType='order'
        style={{ width: '85px' }}
        className='input-sm'
      />
      <span style={{ wordBreak: 'normal' }}>{Price.getUnit()}</span>
    </Flex>
  )
}

export default observer(CellMoney)
