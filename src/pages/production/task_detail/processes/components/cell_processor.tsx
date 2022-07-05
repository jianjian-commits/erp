import { t } from 'gm-i18n'
import React, { FC } from 'react'
import { observer } from 'mobx-react'
import { Tip } from '@gm-pc/react'

import FactoryModalSelector from '../../components/factory_modal_selector'
import store from '../../store'

interface CellProcessorProps {
  index: number
}

// 工序关联小组修改
const CellProcessor: FC<CellProcessorProps> = observer(({ index }) => {
  const { taskProcesses } = store
  const original = taskProcesses[index]

  const handleSelect = (selected: string[]) => {
    if (selected.length < 2) {
      Tip.tip(t('当前必须选择到小组'))
      return
    }
    store.updateTaskProcesses(index, 'processor_select', selected)
  }

  // 若是有重新选择的数据, 按原有数据展示
  let selected: string[] = [original.processor || '']
  if (original.processor_select?.length) {
    selected = original.processor_select
  }

  return (
    <FactoryModalSelector
      key={index}
      selected={selected}
      onSelect={handleSelect}
      isView={!original.isEditing}
      processor_id={original.processor}
    />
  )
})

export default CellProcessor
