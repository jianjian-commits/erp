/*
 * @Description:sku相关
 */
import { CategoryTreeCache_CategoryInfo } from 'gm_api/src/merchandise'

/**
 * @description: 根据category map获取拼接的分类名
 * @param {Record<string, CategoryTreeCache_CategoryInfo>} categoryMap
 * @param {string} categoryId
 * @return {string} 如蔬菜/白菜
 */
export function getCategoryName(
  categoryMap: Record<string, CategoryTreeCache_CategoryInfo>,
  categoryId: string,
  separator = '/',
) {
  let lastCategory = categoryMap[categoryId]
  if (!lastCategory) return ''
  const cagetoryNameArr: string[] = [lastCategory.name!]

  while (Number(lastCategory.parent_id)) {
    lastCategory = categoryMap[lastCategory.parent_id!]
    cagetoryNameArr.unshift(lastCategory?.name!)
  }
  return cagetoryNameArr.filter(Boolean).join(separator)
}
