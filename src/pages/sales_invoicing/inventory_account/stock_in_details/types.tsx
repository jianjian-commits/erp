import type { MoreSelectDataItem } from '@gm-pc/react'

interface FilterType {
  begin_time: Date
  end_time: Date
  q: string
  category_id?: string
  supplier_id?: string
  with_additional?: boolean
  operate_type: number
  target_customer_ids?: MoreSelectDataItem<string>[]
  target_route_ids?: MoreSelectDataItem<string>[]
  purchaser_id?: string
  target_id?: string
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
