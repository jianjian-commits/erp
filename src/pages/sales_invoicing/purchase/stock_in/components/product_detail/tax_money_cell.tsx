import React, { FC, useEffect } from 'react'
import { observer } from 'mobx-react'
// import _ from 'lodash'
import Big from 'big.js'
import { Flex, Price } from '@gm-pc/react'
import store from '../../stores/receipt_store1'
import { toFixed } from '@/common/util'
import { computed } from 'mobx'
import { DetailStore } from '../../stores'

interface Props {
  index: number
}
const TaxMoneyCell: FC<Props> = (props) => {
  const { index } = props

  const tax_money = computed(() => DetailStore.tax_money(index)).get()

  // useEffect(() => {
  //   DetailStore.changeProductItem(index, { tax_money })
  // }, [index, tax_money])

  return (
    <Flex alignCenter>{toFixed(Big(tax_money || 0), 2) + Price.getUnit()}</Flex>
  )
}

export default observer(TaxMoneyCell)
