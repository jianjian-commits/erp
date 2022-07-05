import { Key } from 'react'
import { DataNode, DataNodeMap } from '@/common/interface'

/**
 * @description 树形结构转为平级
 */
export const flatTreeDataToList = (
  treeData: DataNode[],
  flatTreeData: DataNodeMap,
) => {
  treeData.forEach((item) => {
    flatTreeData[item.key] = item
    if (item.children) flatTreeDataToList(item.children, flatTreeData)
  })
  return flatTreeData
}

/**
 * @description 盒子滚动到底部
 * @param id 元素ID
 */
export const scrollToBottom = (id: string) => {
  const ele = document.getElementById(id)
  if (!ele) return
  if (ele.scrollHeight > ele.clientHeight) {
    // 设置滚动条到最底部
    ele.scrollTop = ele.scrollHeight
  }
}

/**
 * @description 获取需要禁用的id集合
 */
export const getDisabledList = (
  currentSelectedList: Key[] = [],
  selectedList: Key[] = [],
  flatTreeData: DataNodeMap,
): Key[] => {
  const disabledList = selectedList.filter(
    (f) => !currentSelectedList.includes(f),
  )
  disabledList.forEach((disabledKey) => {
    const item = flatTreeData[disabledKey]
    if (item && item.parentId === '0') {
      if (item.children && item.children.length > 0) {
        item.children.forEach((node) => {
          disabledList.push(node.key)
        })
      }
    } else {
      disabledList.push(item.parentId)
    }
  })
  return disabledList
}

/**
 * @description 判断当前分类id 是否存在
 */
export const filterIds = (
  ids: string[] | unknown,
  idMap: DataNodeMap,
): string[] => {
  if (!Array.isArray(ids)) return []
  const filterIds = ids.filter((id) => idMap[id])

  return filterIds
}
