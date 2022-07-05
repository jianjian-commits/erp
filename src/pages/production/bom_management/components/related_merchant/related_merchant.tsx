import { useGMLocation } from '@gm-common/router'
import React from 'react'
import { MerchantTable } from './components'

/**
 * 关联商户标签页的组件函数
 */
const RelatedMerchant = () => {
  const { query } = useGMLocation<{ bom_id: string }>()
  const bomId = query.bom_id

  return <MerchantTable bomId={bomId} />
}

export default RelatedMerchant
