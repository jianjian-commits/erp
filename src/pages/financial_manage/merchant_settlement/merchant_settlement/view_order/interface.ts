import {
  OrderDetail,
  Order,
  Order_State,
  Order_PayState,
} from 'gm_api/src/order'
import { MoreSelectDataItem } from '@gm-pc/react'
import { Customer, CustomerUser, GroupUser } from 'gm_api/src/enterprise'
import { Filters_Bool } from 'gm_api/src/common'

export interface levelList {
  value: string
  text: string
  children?: levelList[]
}

export interface BatchProps {
  selected: string[]
  isSelectAll: boolean
}

export interface FilterOptions {
  begin: Date
  end: Date
  dateType: number
  status: Order_State
  pay_status: Order_PayState
  is_out_stock: string
  serial_no: string
  receive_customer_id: string
  app_id: string
  customers: MoreSelectDataItem<string>[]
  sale_menus: MoreSelectDataItem<string>[]
  drivers: MoreSelectDataItem<string>[]
  sort_remark: string
  service_period_id: string

  has_remark: string
  is_create_stock_sheet: Filters_Bool
  is_scan_receipt: Filters_Bool
}

// 交易流水
export interface TransactionFlow {
  change_time: string // 变动时间
  change_type: number // 变动类型
  change_amount: string // 变动金额
  operator: string // 操作人
  mark: string // 备注
  serial_number: string // 交易流水号
}

export interface OrderInfo extends Order {
  editing?: boolean
  company?: string
  customer?: string
  creator?: GroupUser
  driver?: GroupUser
  tempStateFe?: number
  credit_type?: string
  customer_label?: string
}
export type ScanSearchType = (
  value: string,
  afterFunc: (isSuccess: boolean) => void,
) => void
