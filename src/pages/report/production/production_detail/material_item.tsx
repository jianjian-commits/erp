import React, { FC } from 'react'
import { Flex } from '@gm-pc/react'
import { Task_Type } from 'gm_api/src/production'

import CellFull from '@/pages/production/components/table_cell_full'
import { toFixed } from '@/pages/production/util'
import type { ReportDetailInfo } from '../interface'

interface Props {
  original: ReportDetailInfo
  field: string
  value?: string
  taskType: Task_Type
  isAmount?: boolean
}

const MaterialItem: FC<Props> = ({
  original,
  field,
  value,
  taskType,
  isAmount,
}) => {
  const { by_products } = original

  if (taskType === Task_Type.TYPE_PACK || !by_products?.by_products?.length) {
    return <div>{isAmount ? (value ? toFixed(value) : '-') : value || '-'}</div>
  }

  return (
    <CellFull
      list={[{ [field as string]: value }, ...by_products?.by_products]}
      renderItem={(v) => (
        <Flex alignCenter>
          {isAmount ? (v[field] ? toFixed(v[field]) : '-') : v[field] || '-'}
        </Flex>
      )}
    />
  )
}

export default MaterialItem
