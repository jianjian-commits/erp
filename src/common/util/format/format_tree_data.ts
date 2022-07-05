/*
 * @Description: 格式化树形数据util
 */

import { TreeListItem } from '@gm-pc/react'
import _ from 'lodash'
import { DataNode, DataNodeMap, DataOption } from '@/common/interface'

interface ObjectOfKey<T> {
  [key: number]: T
  [key: string]: T
}
/**
 * @description 树形结构转为平级
 */
export const flatTreeDataToMap = (
  treeData: DataNode[],
  flatTreeData: DataNodeMap,
  level = 0,
) => {
  treeData.forEach((item) => {
    item.level = level as any
    flatTreeData[item.key] = item

    if (item.children) flatTreeDataToMap(item.children, flatTreeData, level + 1)
  })
  return flatTreeData
}

/**
 * @description 平级数组转树形结构
 */
export const formatTreeData = (list: DataNode[]) => {
  const treeData: DataNode[] = []

  if (!Array.isArray(list)) return treeData
  const listMap: DataNodeMap = {}
  list.forEach((item) => {
    listMap[item.key] = item
  })
  list.forEach((item) => {
    const parentNode = listMap[item.parentId]
    if (parentNode) {
      if (!parentNode.children) parentNode.children = []

      parentNode.children.push(item)
    } else {
      // 后台存在脏数据,加一个根节点的判断
      if (item.parentId === '0') treeData.push(item)
    }
  })
  return treeData
}

/**
 * @description treeData树形结构转换成 Cascader 级联组件格式
 */
export const formatCascaderData = (treeData: DataNode[]): DataOption[] => {
  if (treeData.length === 0) return []
  return treeData.map((item) => {
    return {
      value: item.value,
      label: item.title,
      children: formatCascaderData(item.children || []),
    }
  })
}

/**
 * @description 将平铺数据转换成树结构（旧组件方法，弃用）
 */
export const formatDataToTree = <T extends { [key: string]: any }>(
  data: T[],
  valueName: keyof T,
  textName: keyof T,
  all?: (T & TreeListItem)[],
): (T & TreeListItem)[] => {
  const result: (T & TreeListItem)[] = all?.length ? all : []
  const idMap: ObjectOfKey<T & TreeListItem> = {}

  _.each(data, (item) => {
    idMap[item[valueName]] = {
      ...item,
      value: item[valueName],
      text: item[textName],
      parent_id: item.parent_id,
    }
  })

  // 放到合适的位置
  _.each(idMap, (v) => {
    if (v.parent_id && v.parent_id !== '0') {
      const parent = idMap[v.parent_id]

      if (!parent.children) {
        parent.children = []
      }

      parent.children.push(v)
    } else {
      result.push(v)
    }
  })

  return result
}
