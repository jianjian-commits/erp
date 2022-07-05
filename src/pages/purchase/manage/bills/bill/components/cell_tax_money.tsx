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
const CellTaxMoney: FC<CellMoneyProps> = (props) => {
  const { index } = props
  const tax_money = computed(() => store.tax_money(index)).get()

  useEffect(() => {
    store.updateRowColumn(index, 'tax_money', +tax_money)
  }, [index, tax_money])

  return (
    <Flex alignCenter>{toFixed(Big(tax_money || 0), 2) + Price.getUnit()}</Flex>
  )
}

export default observer(CellTaxMoney)
