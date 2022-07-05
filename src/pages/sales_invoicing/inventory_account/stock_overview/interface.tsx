import { ExpireType } from 'gm_api/src/inventory'
import { SortBy } from 'gm_api/src/common'
interface FilterType {
  begin_time: Date
  end_time: Date
  sku_id: string
  sku_unit_id: string
  q: string
  with_additional: boolean
  category_id?: string
  batch_level: number
  expire_type?: ExpireType
  sort?: SortBy[]
}

interface ChoseSelect {
  select_all: string[]
  select_tree: { [key: string]: string[] }
  select_batch: string[]
}

export type { FilterType, ChoseSelect }
