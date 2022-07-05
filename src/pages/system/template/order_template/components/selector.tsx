import React, { FC } from 'react'
import { Select } from '@gm-pc/react'
import _ from 'lodash'
import { observer } from 'mobx-react'
import type { SelectDataItem } from '@gm-pc/react'

interface SelectorProps {
  list: SelectDataItem[]
  original: any
  onChange: (selected: any) => void
}
const Selector: FC<SelectorProps> = observer(
  ({ original: { col_index }, list, onChange }) => (
    <Select
      disabled={list.length <= 1}
      value={col_index}
      onChange={onChange}
      data={list}
      style={{ minWidth: 130 }}
    />
  ),
)

export default Selector
