import React, { FC } from 'react'
import { KCSelect } from '@gm-pc/keyboard'
import { observer } from 'mobx-react'
import _ from 'lodash'

import store from '../store'
import { Flex } from '@gm-pc/react'
import { Tag } from 'antd'

interface Props {
  index: number
}

const CellUnitSelector: FC<Props> = observer(({ index }) => {
  const original = store.taskInfo.product_details![index]

  if (!original.sku_id) {
    return <span>-</span>
  }

  const handleChange = (value: string) => {
    const unit_name =
      _.find(original.unit_ids, (u) => u.value === value)?.name || ''
    store.updateListItem(index, { ...original, unit_id: value, unit_name })
  }

  return (
    <KCSelect
      data={original.unit_ids}
      value={original.unit_id}
      onChange={handleChange}
      renderItem={(v) => {
        const { tag, text } = v
        return (
          <Flex alignCenter justifyBetween>
            {text}
            <Tag color='blue' style={{ marginLeft: 4 }}>
              {tag}
            </Tag>
          </Flex>
        )
      }}
    />
  )
})

export default CellUnitSelector
