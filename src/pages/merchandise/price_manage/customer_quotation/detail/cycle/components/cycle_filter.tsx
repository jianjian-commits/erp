import { SKU_TYPE_OPTIONS } from '@/pages/merchandise/price_manage/customer_quotation/constants'
import { Select } from 'antd'
import React, { FC } from 'react'
import store from '../store'

/**
 * 周期报价单标题
 */
const CycleFilter: FC = () => {
  const { skuType, setSkuType } = store

  return (
    <Select
      options={SKU_TYPE_OPTIONS}
      value={skuType}
      onChange={(value) => setSkuType(value)}
    />
  )
}

export default CycleFilter
