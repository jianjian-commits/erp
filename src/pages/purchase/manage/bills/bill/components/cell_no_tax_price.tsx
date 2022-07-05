import React, { FC, useEffect, useMemo } from 'react'
import { observer } from 'mobx-react'
import _ from 'lodash'
import Big from 'big.js'
import { Flex, Price } from '@gm-pc/react'
import store from '../store'
import { toFixed } from '@/common/util'
import { computed } from 'mobx'

interface CellPriceProps {
  index: number
}
const CellNoTaxPrice: FC<CellPriceProps> = (props) => {
  const { index } = props
  const { purchase_unit_name } = store.list[index]

  const no_tax_purchase_price = computed(() =>
    store.no_tax_purchase_price(index),
  ).get()

  const filter_no_purchase_price = useMemo(() => {
    const verify = _.includes(no_tax_purchase_price.toString(), '.')
    const price = (verify && no_tax_purchase_price.toString().split('.')) || []
    if (price?.[1]?.length > 6) {
      return price[0] + '.' + price[1].substring(0, 6) + '...'
    } else {
      return no_tax_purchase_price || 0
    }
  }, [no_tax_purchase_price])

  useEffect(() => {
    store.updateRowColumn(
      index,
      'no_tax_purchase_price',
      +no_tax_purchase_price,
    )
  }, [index, no_tax_purchase_price])

  return (
    <Flex alignCenter>
      {filter_no_purchase_price || 0 + Price.getUnit()}/{purchase_unit_name}
    </Flex>
  )
}

export default observer(CellNoTaxPrice)
