import { Sku } from 'gm_api/src/merchandise'
import { PurchaseTask_RequestDetails_RequestDetail } from 'gm_api/src/purchase'

interface TableList extends PurchaseTask_RequestDetails_RequestDetail {
  // 用于表格的选中
  table_id: number
  supplier_id: string
  sku: Sku
}

interface NumberTableList {
  supplier_id: string // ids
  need_value: string // 数量
}

interface ValueNumberTable {
  numberTable: NumberTableList[]
}

export type { TableList, NumberTableList, ValueNumberTable }
