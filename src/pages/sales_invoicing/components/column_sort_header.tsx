import { SortHeader } from '@gm-pc/table-x/src/components'
import React, { FC } from 'react'
import type { SortItem } from '@/common/interface'

interface Props {
  title: string
  field?: string
  sortItem: SortItem
  sortProductList: Function
}

const ColumnSortHeader: FC<Props> = ({
  title,
  field,
  sortItem,
  sortProductList,
}) => {
  const { sort_by, sort_direction } = sortItem
  return (
    <span>
      {title}
      <SortHeader
        onChange={(direction) => {
          sortProductList({
            sort_by: field,
            sort_direction: direction,
          })
        }}
        type={sort_by === field ? sort_direction : null}
      />
    </span>
  )
}

export default ColumnSortHeader
