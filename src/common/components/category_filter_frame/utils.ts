import { DataNodeMap } from '@/common/interface'
import { Key } from 'react'
import { DEFAULT_TREE_NAME_ENUM } from './constants'

/**
 * 通过Tree 选择的节点值 和 分类Map 获取 Cascader 的值，实现不同组件的联动
 * @param selectedKey 树选择的key
 * @param treeDataMap 树map
 */
export const getCategoryValue = (
  selectedKeys: Key[],
  treeDataMap: DataNodeMap,
): Key[] => {
  const key = selectedKeys[0]
  const treeNode = treeDataMap[key]
  if (!key || !treeNode) return [DEFAULT_TREE_NAME_ENUM.key]
  //
  if (treeNode.parentId === '0') return selectedKeys

  return getCategoryValue([treeNode.parentId, ...selectedKeys], treeDataMap)
}
