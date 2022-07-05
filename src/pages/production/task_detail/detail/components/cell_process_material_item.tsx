import React, { FC } from 'react'
import { Flex } from '@gm-pc/react'
import _ from 'lodash'
import { observer } from 'mobx-react'
import { TaskProcess, TaskProcess_Material } from 'gm_api/src/production'

import CellFull from '../../../components/table_cell_full'
import { cellHeight } from '@/pages/production/enum'

interface Props {
  list: TaskProcess
  renderText: (p: TaskProcess_Material, index: number) => string
}

const CellProcessMaterialItem: FC<Props> = observer(({ list, renderText }) => {
  if (!list?.inputs?.inputs?.length) {
    return (
      <Flex alignCenter style={{ height: '45px' }}>
        -
      </Flex>
    )
  }

  return (
    <CellFull
      list={list?.inputs?.inputs || []}
      renderItem={(p, index: number) => renderText(p, index)}
      calculateHeight={() => cellHeight}
    />
  )
})

export default CellProcessMaterialItem
