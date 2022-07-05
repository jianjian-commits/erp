import { getTaskTypes } from '@/pages/production/util'
import { useAsync } from '@gm-common/hooks'
import { MoreSelect, MoreSelectDataItem } from '@gm-pc/react'
import { t } from 'gm-i18n'
import { ListTaskBatch } from 'gm_api/src/production'
import React, { FC, useEffect, useState } from 'react'

interface Props {
  productionOrderId: string
  isProduce: boolean
  selected: MoreSelectDataItem<number>
  onSelect: (selected: any) => void
}

const BatchesSelector: FC<Props> = ({
  selected,
  onSelect,
  productionOrderId,
  isProduce,
}) => {
  const handleRequest = () => {
    return ListTaskBatch({
      task_types: getTaskTypes(isProduce ? undefined : 2),
      production_order_id: productionOrderId,
    }).then((json) => {
      // 处理好数据
      const { batches } = json.response

      setBatches(
        (batches || []).map((v, index) => {
          // 针对无波次特殊处理
          let text: string = v
          let value: number = index + 1
          if (v === '') {
            text = t('无备注')
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
    cacheKey: `taskBatches`,
  })

  useEffect(() => {
    run()
  }, [])

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
