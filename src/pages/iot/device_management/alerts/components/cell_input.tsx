import React, { FC } from 'react'
import { InputNumber } from '@gm-pc/react'
import { observer } from 'mobx-react'
import storeInfo from '../store/storeInfo'
import { CellProps } from '../interface'

const CellInput: FC<CellProps> = ({ data, index, name }) => {
  return (
    <InputNumber
      value={data[name!]}
      onChange={(value) => storeInfo.changeStrategyData(name!, value!, index)}
    />
  )
}

export default observer(CellInput)
