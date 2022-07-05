import { useGMLocation } from '@gm-common/router'
import React from 'react'
import { RecordTable } from './components'

/**
 * 操作列表标签页的组件函数
 */
const OperationRecord = () => {
  const { query } = useGMLocation<{ bom_id: string }>()
  const bomId = query.bom_id

  return <RecordTable bomId={bomId} />
}

export default OperationRecord
