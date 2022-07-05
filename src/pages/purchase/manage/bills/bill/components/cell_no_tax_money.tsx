import React, { FC, useEffect } from 'react'
import { observer } from 'mobx-react'
import Big from 'big.js'
import { Flex, Price } from '@gm-pc/react'
import store from '../store'
import { toFixed } from '@/common/util'
import { computed } from 'mobx'

interface CellMoneyProps {
  index: number
}
const CellNoTaxMoney: FC<CellMoneyProps> = (props) => {
  const { index } = props
  const { status } = store.info

  const no_tax_purchase_money = computed(() =>
    store.no_tax_purchase_money(index),
  ).get()

  useEffect(() => {
    store.updateRowColumn(
      index,
      'no_tax_purchase_money',
      +no_tax_purchase_money,
    )
  }, [index, no_tax_purchase_money])

  return (
    <Flex alignCenter>
      {toFixed(Big(no_tax_purchase_money || 0), 2) + Price.getUnit()}
    </Flex>
  )
}

export default observer(CellNoTaxMoney)
