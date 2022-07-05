import React, { useState, Key } from 'react'
import FilterBar from './filter_bar'
import TreeTable from './tree_table'
import { ComponentContext, DEFAULT_TREE_NAME_ENUM } from './constants'
import { CategoryFilterTreeProps } from './data'
import { Form } from 'antd'
import { flatTreeDataToMap } from '@/common/util'

import './style.less'

const CategoryFilterTree = (props: CategoryFilterTreeProps) => {
  const {
    extraRight,
    onFilterChange,
    filterNode,
    filterOptions,
    table,
    treeData,
    defaultAllClassifyTitle,
  } = props

  const treeDataMap = flatTreeDataToMap(treeData, {})

  const [form] = Form.useForm()

  /** 是否展开树 */
  const [isExpandTree, setExpandTree] = useState(false)
  /** 树选择项 */
  const [selectedKeys, setSelectedKeys] = useState<Key[]>([
    DEFAULT_TREE_NAME_ENUM.key,
  ])

  return (
    <ComponentContext.Provider
      value={{
        isExpandTree,
        setExpandTree,
        selectedKeys,
        setSelectedKeys,
        treeDataMap,
      }}
    >
      <FilterBar
        form={form}
        extraRight={extraRight}
        filterNode={filterNode}
        filterOptions={filterOptions}
        treeData={treeData}
        defaultAllClassifyTitle={defaultAllClassifyTitle}
        onFilterChange={onFilterChange}
      />
      <TreeTable
        table={table}
        defaultAllClassifyTitle={defaultAllClassifyTitle}
        treeData={treeData}
        form={form}
        onFilterChange={onFilterChange}
      />
    </ComponentContext.Provider>
  )
}

export default CategoryFilterTree
