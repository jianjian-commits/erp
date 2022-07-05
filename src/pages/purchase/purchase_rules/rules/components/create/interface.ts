import { Customer } from 'gm_api/src/enterprise'

interface ListType {
  key: string
  name: string
  age: number
  address: string
  tags: string[]
}
interface CustomerList extends Customer {
  customer_label?: string
}

interface LabelFilter {
  label: string
  value: string
}

interface List {
  name: string
  customer_id?: string
  sku_id?: string
  supplier_id?: string
  purchaser_id?: string
  level_field_id?: string
}

type Params = {
  customer_label_ids: []
  q: string
}

interface AddRulesRef {
  handleVerify: () => Promise<boolean>
}

export type { ListType, CustomerList, Params, LabelFilter, List, AddRulesRef }
