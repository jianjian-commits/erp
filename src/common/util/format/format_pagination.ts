import { PagingParams } from 'gm_api/src/common'

/**
 * @description ant-design Table 组件参数转换
 * @param currentPage 当前页面
 * @param pageSize  页容量
 */
export const formatParamsForPagination = (
  currentPage: number,
  pageSize = 10,
): PagingParams => {
  let offset = 0
  const result = currentPage * pageSize - pageSize
  if (result > 0) {
    offset = result
  }
  return {
    limit: pageSize,
    offset,
    need_count: true,
  }
}
