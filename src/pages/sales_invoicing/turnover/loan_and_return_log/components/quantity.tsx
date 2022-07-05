import React, { FC } from 'react'
import { observer } from 'mobx-react'
import { InputNumber, Flex } from '@gm-pc/react'
import { StockSheetInfo } from '../../interface'

interface Props {
  index: number
  updateSheetInfo: <T extends keyof StockSheetInfo>(
    index: number,
    key: T,
    value: StockSheetInfo[T],
  ) => any
  data: StockSheetInfo
}

const Quantity: FC<Props> = (props) => {
  const {
    index,
    updateSheetInfo,
    data: { quantity, base_unit_name, edit },
  } = props
  return (
    <Flex alignCenter flex>
      {edit ? (
        <InputNumber
          min={0}
          value={quantity}
          onChange={(e) => {
            updateSheetInfo(index, 'quantity', e)
          }}
        />
      ) : (
        quantity
      )}
      <span style={{ minWidth: 'max-content' }}>{base_unit_name}</span>
    </Flex>
  )
}

export default observer(Quantity)
