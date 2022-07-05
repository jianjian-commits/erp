interface FilterType {
  begin_time: Date
  end_time: Date
  q: string
  category_id?: string
  target_id?: string | undefined
  operate_type: number
  with_additional?: boolean
  processor_ids?: string[]
  warehouse_id?: string
}

interface PagingRequest {
  offset?: number
  limit?: number
  need_count?: boolean
}
interface TableRequestParams {
  paging: PagingRequest
}

export type { FilterType, TableRequestParams }
