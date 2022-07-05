import { getTaskTypes } from '@/pages/production/util'
import { useAsync } from '@gm-common/hooks'
import { MoreSelect, MoreSelectDataItem } from '@gm-pc/react'
import { t } from 'gm-i18n'
import { ListTaskBatch, Task_TimeType, Task_Type } from 'gm_api/src/production'
import React, { FC, useEffect, useState } from 'react'

interface Props {
  begin_time: string
  end_time: string
  time_type: Task_TimeType
  selected: MoreSelectDataItem<number>
  onSelect: (selected: any) => void
  task_type?: Task_Type
}

const BatchesSelector: FC<Props> = ({
  begin_time,
  end_time,
  time_type,
  selected,
  onSelect,
  task_type,
}) => {
  const handleRequest = () => {
    return ListTaskBatch({
      begin_time,
      end_time,
      time_type,
      task_types: getTaskTypes(task_type),
    }).then((json) => {
      // 处理好数据
      const { batches } = json.response

      setBatches(
        (batches || []).map((v, index) => {
          // 针对无波次特殊处理
          let text: string = v
          let value: number = index + 1
          if (v === '') {
            text = t('无波次')
            value = -1
          }
          return {
            value,
            text,
          }
        }),
      )
      return null
    })
  }
  const [batches, setBatches] = useState<MoreSelectDataItem<number>[]>([])

  const { run } = useAsync(handleRequest, {
    cacheKey: `productionBatches`,
  })

  useEffect(() => {
    run()
  }, [begin_time, end_time])

  const handleSelect = (selected: MoreSelectDataItem<number>) => {
    if (!selected) {
      onSelect({ value: '', text: '' })
      return
    }
    onSelect(selected)
  }

  return (
    <MoreSelect
      data={batches}
      selected={selected}
      onSelect={handleSelect}
      placeholder={t('全部')}
    />
  )
}

export default BatchesSelector
