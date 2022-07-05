// 工序列表相关
interface Filter {
  process_type_id: string // 类型
  search_text: string // 输入内容
}

interface PagingRequest {
  offset?: number
  limit: number
  need_count?: boolean
}

interface TableRequestParams {
  [propName: string]: any
  paging: PagingRequest
}

export type { Filter, TableRequestParams }
