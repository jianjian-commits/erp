import { FilterOptions } from '@/pages/order/interface'
import {
  Sku_SupplierCooperateModelType,
  Menu,
  MenuPeriodGroup,
  Quotation,
} from 'gm_api/src/merchandise'
import { OrderDetail, SortingStatus } from 'gm_api/src/order'
import type { Customer, GroupUser } from 'gm_api/src/enterprise'

export type InputKey =
  | 'outstock_unit_value_v2'
  | 'add_order_value1'
  | 'add_order_value2'
  | 'add_order_value3'
  | 'add_order_value4'

export interface F extends FilterOptions {
  category: string[]
  is_weight: string
  sort_status: SortingStatus
  is_create_purchase_task: number
  is_create_production_task: number
  sku_is_process: number
  sku_q: string
  accept_state: number
  manual_purchase: number
  supplier_cooperate_model_type: Sku_SupplierCooperateModelType | -1
}

/**
 * list-按订单查看
 */
export interface OrderInfoViewOrder extends OrderDetail {
  editing?: boolean
  customer?: Customer
  creator?: GroupUser
  driver?: GroupUser
  menu_period_group?: MenuPeriodGroup
  tempStateFe?: number
  catagorySum?: Record<number, string>
  orderQuantity?: Record<number, string>
  processNum?: Record<number, string>
  notProcessNum?: Record<number, string>
  menu?: Menu
  quotation?: Quotation
  quotationName?: string
  // inspectionStatus?: string
}

/**
 * @deprecated
 */
export interface BatchInfo {
  status: number
  remark: string
}

/**
 * 批量操作组件
 */
export interface BatchProps {
  selected: string[]
  isSelectAll: boolean
}
