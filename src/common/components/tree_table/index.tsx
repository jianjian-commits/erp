import React, { FC, useMemo } from 'react'
import { Tree, Spin } from 'antd'
import { DownOutlined } from '@ant-design/icons'
import { DataNode } from '@/common/interface'
import { t } from 'gm-i18n'
import { flatTreeDataToMap } from '@/common/util'
import { TreeTableProps } from './data'
import TreeTitle from './tree_title'

const { TreeNode } = Tree
const treeTableStyle = {
  border: '1px splid red',
  padding: '0px 24px 16px 24px',
}

const iconStyle = { fontSize: '12px', color: 'rgba(0, 0, 0, 0.7)' }

/** 树形表格，使用ant-design Tree 组件 改造  */
const TreeTable: FC<TreeTableProps> = (props) => {
  const { treeData = [], loading = false, treeExtraActions, title } = props

  const treeDataMap = useMemo(() => flatTreeDataToMap(treeData, {}), [treeData])

  /**
   * @description 树节点的渲染，需要对节点进行改造，故不使用 treeData
   */
  const renderTreeNode = (treeData: DataNode[]) => {
    if (treeData.length <= 0 || !treeData) return null

    return treeData.map((item) => (
      <TreeNode
        className={`ant-tree-treenode-${item.level}`}
        key={item.key}
        title={
          // 所有的逻辑放在
          <TreeTitle
            node={item}
            treeExtraActions={treeExtraActions}
            treeDataMap={treeDataMap}
          />
        }
      >
        {renderTreeNode(item.children || [])}
      </TreeNode>
    ))
  }

  return (
    <>
      <div className='category-tree-sum'>
        {title}：{treeData?.length || 0}
      </div>
      <Spin tip={t('加载中...')} spinning={loading}>
        <div style={treeTableStyle} className='category-tree-table'>
          <Tree blockNode switcherIcon={<DownOutlined style={iconStyle} />}>
            {renderTreeNode(treeData)}
          </Tree>
        </div>
      </Spin>
    </>
  )
}

export default TreeTable
