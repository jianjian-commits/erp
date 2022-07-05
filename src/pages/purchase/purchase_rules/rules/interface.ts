import { Customer, GroupUser, Supplier } from 'gm_api/src/enterprise'
import { Sku } from 'gm_api/src/merchandise'

interface LabelFilter {
  label: string
  value: string
  is_delete?: boolean
  [key: string]: any
}

interface Paging {
  limit: number
  offset: number
  need_count: boolean
}

interface ClientListParams {
  paging?: Paging
  q?: string
}

interface MerchandiseListParams {
  paging?: Paging
  q?: string
  category_id?: string
}

type ChooseClient = {
  type: 'client'
  item: Partial<Customer>
}

type ChooseMerchandise = {
  type: 'merchandise'
  item: Partial<Sku>
}

interface ClientFilter {
  sku_name: string
  category_id?: string[] | undefined
  supplier_id?: string | undefined
  purchaser_id?: string | undefined
}

interface TableMap {
  sku_map?: { [key: string]: Sku }
  supplier_map?: { [key: string]: Supplier }
  purchaser_map?: { [key: string]: GroupUser }
  customer_map?: { [key: string]: Customer }
}

interface MerchandiseFilter {
  q: string | undefined
  category_id: string[] | undefined
}

interface GradeContextProps {
  options?: LabelFilter[]
  skuInfo?: Sku
  type?: string
}

interface MerchandiseTabsFilter {
  customer_name: string | undefined
  supplier_name: string | undefined
  purchaser_name: string | undefined
  // gradeName: string | undefined
}

export type {
  LabelFilter,
  Paging,
  ClientListParams,
  MerchandiseListParams,
  ChooseClient,
  ChooseMerchandise,
  TableMap,
  ClientFilter,
  MerchandiseFilter,
  GradeContextProps,
  MerchandiseTabsFilter,
}
