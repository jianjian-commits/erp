import { GetCategoryTree, Category } from 'gm_api/src/merchandise'
import { formatTreeData } from '@/common/util'
import { DataNode } from '@/common/interface'

import _ from 'lodash'

/**
 * @description 获取分类数据 for ant-design
 */

export const SORT = (a: DataNode, b: DataNode) =>
  a.origins.rank! - b.origins.rank!

export const fetchTreeData = () => {
  return GetCategoryTree().then((res) => {
    const {
      response: { categories = [] },
    } = res
    const list = categories
      .map((item) => {
        const { name, parent_id, category_id, level = 1, icon } = item
        return {
          value: category_id,
          key: category_id,
          title: name,
          icon,
          level,
          parentId: parent_id,
          children: [],
          origins: item,
        }
      })
      .filter((f) => f.level !== 0) // 防止后台脏数据，前端过滤level 为 0 的分类
      // @ts-ignore
      .sort(SORT)
    const treeDataMap = _.keyBy(categories, 'category_id')
    const treeData = formatTreeData(list as DataNode[])

    return {
      treeData,
      treeDataMap,
    }
  })
}
