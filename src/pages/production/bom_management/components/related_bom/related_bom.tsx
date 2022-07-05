import { BomList } from '@/pages/production/bom_management/components/bom_list'
import { useGMLocation } from '@gm-common/router'
import React from 'react'

/**
 * 关联BOM标签页的组件函数
 */
const RelatedBom = () => {
  const location = useGMLocation<{ sku_id: string }>()
  const { sku_id } = location.query

  return <BomList sku_id={sku_id} isRelationBom />
}

export default RelatedBom
