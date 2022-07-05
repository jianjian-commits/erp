import {
  AfterSaleOrderDetail,
  AfterSaleOrderDetail_TaskStatus,
} from 'gm_api/src/aftersale'
import { String } from 'lodash'
export interface levelList {
  value: string
  text: string
  children?: levelList[]
}

export interface ObjectOfKey<T> {
  [key: number]: T
  [key: string]: T
}

export interface PagingRequest {
  offset?: number
  limit?: number
  need_count?: boolean
}

export interface TableRequestParams {
  [propName: string]: any
  paging: PagingRequest
}

export interface ReceiptStatusAll<T> {
  TASK_STATUS_UNDONE: T // 未完成
  TASK_STATUS_DONE: T // 已完成
  TASK_STATUS_UNSPECIFIED: T // 全部
}

export type ReceiptStatusAllKey = keyof ReceiptStatusAll<any>

export interface BatchProps {
  selected: string[]
  isSelectAll: boolean
}

export interface FilterOptions {
  begin_time: Date
  end_time: Date
  time_type: number
  search_text?: string
  category_ids: any // 商品筛选
  driver_selected?: any
  route_selected?: any
  status: number // 全部、未完成、已完成、已删除
  sku_name: string
  ssu_customize_code: string
  serial_no: string
  order_serial_no: string
  customer_user_name: string
  customer_name: string
}

export interface ListOptions extends AfterSaleOrderDetail {
  isEditing?: boolean // 编辑态
  sku_name?: string
  category_name: string
  order_code: string
  after_sale_order_serial_no: string
  company: string
  customer: string
  ssu_base_unit_name: string
  route_name: string
  operate_status: AfterSaleOrderDetail_TaskStatus
}
