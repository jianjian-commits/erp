import { Sku, Sku_SupplierCooperateModelType } from 'gm_api/src/merchandise'
import {
  PurchaseTask_RequestDetails_RequestDetail,
  PurchaseTask_Status,
  PurchaseTask_Type,
} from 'gm_api/src/purchase'
import { Task } from '../../interface'
export interface BatchProps {
  selected: string[]
  isSelectedAll: boolean
  onOK: (v: any) => void
}

export type CooperateModelMapType = {
  [key in Sku_SupplierCooperateModelType]: string
}
export interface GoodDetailProps {
  index: number
}

export interface CombineTask extends Task {
  // 是否拥有需求数
  has_not_need?: boolean
  // 是否允许修改仅供货模式
  has_amend_mode?: boolean
}

export interface SplitTable {
  supplier_id: string
  need_value: string
}

export interface SkuUnitName extends Sku {
  unit_name: string
}
export interface TableData extends PurchaseTask_RequestDetails_RequestDetail {
  sku: SkuUnitName
  purchase_sku: SkuUnitName
  rate: string
  customer_name?: string
  levelName?: string
  purchase_time?: string
  purchaser_id: string
  status?: PurchaseTask_Status
  purchase_task_id?: string
  type?: PurchaseTask_Type
  sku_level_filed_id?: string
}
