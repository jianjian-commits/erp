import React, { FC, useEffect } from 'react'
import { observer } from 'mobx-react'
import Big from 'big.js'
import { Flex, Price } from '@gm-pc/react'
import { toFixed } from '@/common/util'
import { computed } from 'mobx'
import store, { PDetail } from '../../stores/receipt_store1'
import { DetailStore } from '../../stores'

interface Props {
  index: number
  data: PDetail
}
const NoTaxAmountCell: FC<Props> = (props) => {
  const { index } = props

  const no_tax_amount = computed(() => DetailStore.no_tax_amount(index)).get()

  useEffect(() => {
    DetailStore.changeProductItem(index, {
      amount: no_tax_amount,
    })
  }, [index, no_tax_amount])

  return (
    <Flex alignCenter>
      {toFixed(Big(no_tax_amount || 0), 2) + Price.getUnit()}
    </Flex>
  )
}

export default observer(NoTaxAmountCell)
