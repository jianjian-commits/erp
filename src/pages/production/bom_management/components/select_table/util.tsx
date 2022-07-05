import { PagingParams } from 'gm_api/src/common'

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
