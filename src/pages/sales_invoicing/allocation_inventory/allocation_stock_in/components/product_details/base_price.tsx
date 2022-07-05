import React, { FC } from 'react'
import { Price } from '@gm-pc/react'
import { observer } from 'mobx-react'
import { getUnNillText } from '@/common/util'

interface BasePriceProps {
  data: any
}

const BasePrice: FC<BasePriceProps> = observer(({ data }) => {
  const input_stock = data?.input_stock || {}
  return (
    <>
      {(input_stock?.input?.price
        ? parseFloat(input_stock?.input?.price)
        : '-') + Price.getUnit()}
    </>
  )
})

export default BasePrice
