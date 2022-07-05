import { Business_Type } from '@/pages/financial_manage/settlement_manage/customer_settlement/constant'
import { FilterOptions } from '@/pages/order/interface'
import { MoreSelectDataItem } from '@gm-pc/react'
import { App_Type, Filters_Bool } from 'gm_api/src/common/types'
import {
  BillOrder_PayAndAfterState,
  BillOrder_Type,
  ListSettleBillResponse,
} from 'gm_api/src/finance'
import { Order_OrderOp, Order_PayState, Order_State } from 'gm_api/src/order'
import moment, { Moment } from 'moment'

export interface F {
  begin: Date
  end: Date
  dateType: number
  is_scan_receipt: Filters_Bool
  customize_type_ids: MoreSelectDataItem<string>[]
  order_op: Order_OrderOp
  app_type: App_Type
  resource: string
  state: Order_State
  pay_after_state: BillOrder_PayAndAfterState
  receive_customer_ids: MoreSelectDataItem<string>[]
  type: BillOrder_Type
  serial_no: string
}

export interface DetailHeader {
  unPay_num_total: string
  needPay_num_total: string
  alreadyPay_num: string
  unPay_num: string
  afterSale_num: string
}

export interface DetailHeaderForm {
  company_name: string
  pay_type: number
  settle_time: Moment
  total_price: number
  customize_settle_voucher: string
}

export type DetailList = DataType & { settle_num: string }

export interface DataType
  extends Omit<DetailHeader, 'unPay_num_total' | 'needPay_num_total'> {
  id: string
  serial_no: string
  customer_name: string
  order_time: string
  business_type: string
  pay_status: string
  children?: DataType[]
  needPay_num: string
}

export type DataType4Detail = Omit<DataType, 'children'> & {
  settle_num: string
  children?: DataType4Detail[]
}

export type Total = Omit<ListSettleBillResponse, 'bill_orders'>

export type GetObjectValue<T> = T extends {
  [key in keyof T]: infer U
}
  ? U
  : never
