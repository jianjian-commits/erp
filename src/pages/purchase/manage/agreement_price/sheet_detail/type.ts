import { Quotation_Status } from 'gm_api/src/merchandise'
import type { MoreSelectDataItem } from '@gm-pc/react'

export interface SheetType {
  skuName: string
  skuId: string
  purchase_unit_name: string
  categoryName: string
  ssuSelectData?: any[]
  price: string
  measUnit: string
  purchase_unit_id?: string
  rate: string

  isEditing: boolean
  quotation_id?: string
  basic_price?: any
  existing?: boolean
  input_tax: string | null
  // ssuId: string
  // pkgPrice: string
  // pkgUnit: string
  //  unitId: string
}

export interface HeaderInfoType {
  serial_no?: string
  supplier?: MoreSelectDataItem<string> | any
  supplier_name?: string
  start_time?: string
  end_time?: string
  remark?: string
  status?: Quotation_Status
  operator?: string
  create_time?: string
  update_time?: string
  last_operator?: string // 最后修改人名字
  quotation_id?: string
}
