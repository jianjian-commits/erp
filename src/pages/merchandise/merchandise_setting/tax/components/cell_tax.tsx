import React, { FC } from 'react'
import { observer } from 'mobx-react'
import store from '../store'

interface Props {
  index: number
  /** 进项/销项 */
  type: 'output' | 'input'
}

const TaxCell: FC<Props> = observer(({ index, type }) => {
  const item = store.skuList[index]
  const value = type === 'output' ? item.tax : item.input_tax

  return <div>{value}%</div>
})

export default TaxCell
