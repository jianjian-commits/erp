import { useAsync } from '@gm-common/hooks'
import { MoreSelect, MoreSelectDataItem } from '@gm-pc/react'
import { t } from 'gm-i18n'
import {
  ListProcessTaskBatch,
  ProcessTask_TimeType,
  ProduceType,
} from 'gm_api/src/production'
import React, { FC, useEffect, useState } from 'react'

interface Props {
  begin_time: string
  end_time: string
  time_type: ProcessTask_TimeType
  selected?: MoreSelectDataItem<number>
  produce_type?: ProduceType
  onSelect: (selected: any) => void
}

const BatchesSelector: FC<Props> = ({
  begin_time,
  end_time,
  time_type,
  selected,
  produce_type,
  onSelect,
}) => {
  const [batches, setBatches] = useState<MoreSelectDataItem<number>[]>([])

  const handleRequest = () => {
    return ListProcessTaskBatch({
      begin_time,
      end_time,
      time_type,
      produce_types: produce_type ? [produce_type] : [1, 3], // 1为组合，3为单品
    }).then((json) => {
      // 处理好数据
      const { batches } = json.response

      const batchesWithNull = (batches || []).map((batch, index) => {
        return {
          value: batch ? index + 1 : -1,
          text: batch || '无波次',
        }
      })

      setBatches(batchesWithNull)
      return null
    })
  }

  const { run } = useAsync(handleRequest, {
    cacheKey: `productionBatches`,
  })

  useEffect(() => {
    run()
  }, [begin_time, end_time, produce_type])

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
