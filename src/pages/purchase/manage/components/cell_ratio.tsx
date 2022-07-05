import React, { FC } from 'react'
import { KCSelect } from '@gm-pc/keyboard'
import type { SelectDataItem } from '@gm-pc/react'

interface CellRatioProps {
  ratio?: string
  data: SelectDataItem[]
  onSelect: (s: string) => void
}

const CellRatio: FC<CellRatioProps> = ({ ratio, data, onSelect }) => {
  return <KCSelect data={data} value={ratio} onChange={onSelect} />
}

export default CellRatio
