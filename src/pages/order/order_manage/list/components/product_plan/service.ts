import { GetCategoryTree } from 'gm_api/src/merchandise'
import { formatTreeData } from '@/common/util'

/**
 * @description 获取分类数据 for ant-design
 */
export const fetchTreeData = () => {
  return GetCategoryTree().then((res) => {
    const { response } = res
    const { categories = [] } = response
    const list = categories.map((item) => {
      const { name, parent_id, category_id } = item
      return {
        value: category_id,
        key: category_id,
        title: name,
        parentId: parent_id,
        children: [],
      }
    })
    return formatTreeData(list)
  })
}
