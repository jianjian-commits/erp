import type { Order } from 'gm_api/src/order'
import type { FilterOptions } from '../../../interface'
import type { Customer, GroupUser } from 'gm_api/src/enterprise'
import { Menu, MenuPeriodGroup, Quotation } from 'gm_api/src/merchandise'
import { Filters_Bool } from 'gm_api/src/common'

/**
 * filter-按订单查看
 */
export interface F extends FilterOptions {
  has_remark: string
  is_create_stock_sheet: Filters_Bool
  is_scan_receipt: Filters_Bool
  inspectionFilterValue: Filters_Bool
}

/**
 * list-按订单查看
 */
export interface OrderInfoViewOrder extends Order {
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
  /** 线路信息 */
  route?: {
    routeId?: string
    name?: string
  }
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
