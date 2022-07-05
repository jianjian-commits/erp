import type { Quotation_Status } from 'gm_api/src/merchandise'

export interface FilterOptions {
  start_time?: string
  end_time?: string
  sku_q: string
  category: string[]
  supplier: any
  statuses: Quotation_Status[]
}
