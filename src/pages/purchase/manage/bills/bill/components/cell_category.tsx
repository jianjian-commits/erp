import React, { FC } from 'react'
import { observer } from 'mobx-react'
import store from '../store'

interface CellCategoryProps {
  index: number
}
const CellCategory: FC<CellCategoryProps> = ({ index }) => {
  const { category_name } = store.list[index] as any
  return <div>{category_name || '-'}</div>
}

export default observer(CellCategory)
