import React, { FC, useEffect } from 'react'
import { observer } from 'mobx-react'
// import _ from 'lodash'
import Big from 'big.js'
import { Flex, Price } from '@gm-pc/react'
import { getEndlessPrice, toFixed } from '@/common/util'
import { computed } from 'mobx'
// import store, { PDetail } from '../../stores/receipt_store'
import { DetailStore } from '../../stores'

interface Props {
  index: number
  data: any
}
const NoTaxPriceCell: FC<Props> = (props) => {
  const { index, data } = props

  const { sku_base_unit_name } = data

  const no_tax_base_price = computed(() =>
    DetailStore.no_tax_base_price(index),
  ).get()

  // useEffect(() => {
  //   DetailStore.changeProductItem(index, { no_tax_base_price })
  // }, [index, no_tax_base_price])

  return (
    <Flex alignCenter>
      {getEndlessPrice(Big(no_tax_base_price || 0)) + Price.getUnit()}/
      {sku_base_unit_name || '-'}
    </Flex>
  )
}

export default observer(NoTaxPriceCell)
