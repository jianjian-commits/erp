import React, { FC } from 'react'
import Big from 'big.js'
import { Price } from '@gm-pc/react'
import { observer } from 'mobx-react'
import { PDetail } from '../../stores/receipt_store'

import globalStore from '@/stores/global'
import { toFixedByType } from '@/common/util'

interface Props {
  data: PDetail
}

const DifferentPriceCell: FC<Props> = observer(({ data }) => {
  const { different_price_show } = data

  return (
    <span>
      {different_price_show === undefined
        ? '-'
        : toFixedByType(+Big(different_price_show || 0), 'dpInventoryAmount') +
          Price.getUnit()}
    </span>
  )
})

export default DifferentPriceCell
