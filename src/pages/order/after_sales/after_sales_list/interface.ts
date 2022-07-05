import { MoreSelectDataItem } from '@gm-pc/react'
import { Order_State, Order_Address } from 'gm_api/src/order'
import {
  AfterSaleOrderDetail_Reason,
  AfterSaleOrderDetail_Method,
  AfterSaleOrderDetail_Type,
  AfterSaleOrder,
  AfterSaleOrderDetail,
} from 'gm_api/src/aftersale'
import { UnitValueSet } from 'gm_api/src/merchandise'

export interface AfterSaleMerchandise extends AfterSaleOrderDetail {
  skuInfo: any
  category_name: string
  amount: string
  sales_price: string
}
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

export interface ReceiptStatus<T> {
  toBeSubmitted: T // 待提交
  submittedIncomplete: T // 已提交未完成
  completed: T // 已完成
  deleted: T // 已删除
  reviewed: T
}

export interface ReceiptStatusAll<T> extends ReceiptStatus<T> {
  all: T // 全部
}

export type ReceiptStatusAllKey = keyof ReceiptStatusAll<any>

// 头部
export interface HeaderDetail {
  remark: string
  creator_name: string
  creator_id?: string
  create_time?: string | undefined
  after_sales_code?: string
  after_status?: number
  // target_id: string
  // target_name: string
  all_detail_num: number
  completed_detail_num: number
  customers: any
  order_code: string
  order_id: string
  after_sale_order_id?: string
  apply_return_amount?: string
  real_return_amount?: string
  order_code_popover: OrderCodePopover
}

interface OrderCodePopover {
  create_time: string
  received_time: string
  state: Order_State
  driver_id: string
  addresses: Order_Address
  route: string
}

// 订单售后明细
export interface AfterSalesList {
  order_detail_id: string
  apply_return_amount: string // 申请退款金额
  real_return_amount: string // 实退金额
  department_blame_name: string // 责任部门
  department_to_name: string // 跟进部门
  reason: AfterSaleOrderDetail_Reason // 售后原因
  method: AfterSaleOrderDetail_Method // 售后方式
  remark: string // 备注
  last_operator_id: string // 最后操作人
  type: AfterSaleOrderDetail_Type
  flag: number
}

// 仅退款明细
export interface RefundOnlyList extends AfterSalesList {
  sku_id: string
  sku_name: any
  category_name: string // 分类
  sale_ratio: string // 规格
  amount: string // 出库数
  sales_price: string // 销售价格
  ssu_base_unit_name: string // 基本单位
  ssu_base_unit_id: string
  ssu_unit_name: string // 包装单位
  ssu_unit_name_id: string
  type: AfterSaleOrderDetail_Type // 退货类型

  apply_return_value: UnitValueSet // 申请退款数 与 申请退款数
  // application_refund_amount: string // 申请退款数
  // application_price: string // 申请单价

  supplier_id: string // 供应商ID
  supplier_name: any // 供应商名
  fee_unit_name: string // 定价单位名称
  outstock_unit_name: string // 出库单位名称
  unit_id: string // 下单单位
  units: any[]
}

// 退货退款
export interface ReturnRefundList extends RefundOnlyList {
  driver_id: string // 司机
  task_method?: string // 处理方式
  apply_return_amount: string
  real_return_value?: UnitValueSet
}

export interface Filter {
  begin_time: Date
  end_time: Date
  time_type: number
  search_text?: string
  serial_no?: string
  order_serial_no?: string
  customer_user_name?: string
  customer_name?: string
  quotation_id?: MoreSelectDataItem<any>[]
  driver_id?: MoreSelectDataItem<any>[]
  // geography_label_selected?: any
  city_id?: string
  district_id?: string
  street_id?: string
  order_state?: number
  customer_label_id?: any
  status?: number // 全部、待提交、已提交未完成、已完成、已删除
}

export interface AfterSaleList extends AfterSaleOrder {
  order_serial_no: string
  order_state: number
  order_create_time: string
  company: string
  customer: string
  receive_time?: string
  creator?: string
  quotation?: string
  driver?: string
  customer_label?: string
  geoTag?: string
  addresses?: Addresses
}

interface Addresses {
  district_id: string
  city_id: string
  street_id: string
}
