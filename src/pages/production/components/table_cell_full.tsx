import React, { FC, ReactNode } from 'react'
import { TableXCellFull, TableXCellFullItem } from '@gm-pc/table-x'
import _ from 'lodash'

type Value = any

interface CellFullProps {
  list: Value[]
  renderItem: (item: Value, i: number) => ReactNode | string
  calculateHeight?: (v: Value) => number
  // height?: string
}

const CellFull: FC<CellFullProps> = ({ list, renderItem, calculateHeight }) => {
  return (
    <TableXCellFull>
      {_.map(list, (v: any, i: number) => (
        <TableXCellFullItem
          key={i}
          style={{
            display: 'flex',
            alignItems: 'center',
            height: calculateHeight ? `${calculateHeight(v)}px` : '45px',
          }}
        >
          {renderItem(v, i)}
        </TableXCellFullItem>
      ))}
    </TableXCellFull>
  )
}

export default CellFull
