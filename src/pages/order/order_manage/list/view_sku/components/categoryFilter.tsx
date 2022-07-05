import React, { FC } from 'react'
import { Cascader } from 'antd'
import { formatCascaderData } from '@/common/util'
import { DataNode } from '@/common/interface'

interface CategoryFilterProps {
  onChange: (v: any) => void
  selected: string[]
  cascaderOptions: DataNode[]
}
const CategoryFilter: FC<CategoryFilterProps> = (props) => {
  const { onChange, selected, cascaderOptions } = props

  return (
    <Cascader
      style={{ minWidth: '275px' }}
      expandTrigger='hover'
      changeOnSelect
      allowClear={false}
      options={formatCascaderData(cascaderOptions)}
      value={selected}
      onChange={onChange}
    />
  )
}

export default CategoryFilter
