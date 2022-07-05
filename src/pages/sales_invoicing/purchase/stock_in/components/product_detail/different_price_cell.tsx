import React, { FC } from 'react'
import Big from 'big.js'
import { Price } from '@gm-pc/react'
import { observer } from 'mobx-react'
import { PDetail } from '../../stores/receipt_store1'
import { toFixedByType } from '@/common/util'

interface Props {
  data: PDetail
}

/**
 * @deprecated 差价已废弃
 */
const DifferentPriceCell: FC<Props> = observer(({ data }) => {
  const { different_price } = data

  return (
    <span>
      {different_price === undefined
        ? '-'
        : toFixedByType(+Big(different_price || 0), 'dpInventoryAmount') +
          Price.getUnit()}
    </span>
  )
})

export default DifferentPriceCell
