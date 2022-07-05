import { SortBy } from 'gm_api/src/common'
interface ExpandedType {
  [key: number]: boolean
}
interface FilterType {
  begin_time: Date
  end_time: Date
  q?: string
  category_id?: string
  sort: SortBy[]
  warehouse_id?: string
}

interface StockTotalValue {
  begin_stock: Values
  end_stock: Values
  all_in_stock: Values
  all_out_stock: Values
}

interface Values {
  amount: string
  price: string
  quantity: string
}
export type { ExpandedType, FilterType, StockTotalValue }
