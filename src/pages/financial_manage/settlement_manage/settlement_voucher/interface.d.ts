import { MoreSelectDataItem } from '@gm-pc/react'
import {
  BillOrder_PayAndAfterState,
  BillOrder_Type,
  PayType,
  SettleSheet_SettleStatus,
} from 'gm_api/src/finance'
import { Moment } from 'moment'

export interface F {
  begin: Date
  end: Date
  target_ids: MoreSelectDataItem<string>[]
  customize_settle_voucher: string
  settle_status: SettleSheet_SettleStatus
}

export interface List {
  settle_sheet_id: string
  customize_settle_voucher: string
  settle_time: string
  target_id: string
  target_name: string
  total_price: string
  settle_status: SettleSheet_SettleStatus
}

export interface DetailHeaderInfo {
  total_price: string
  total_outstock_price: string
  total_paid_price: string
  unPay_price: string
  total_after_sale_price: string
  needPay_price: string
}

export interface DetailHeader {
  settle_sheet_id: string
  target_id: string
  target_name: string
  pay_type: PayType
  settle_time: string
  customize_settle_voucher: string
  create_time: string
  creator_id: string
  creator_name: string
  settle_status: SettleSheet_SettleStatus
}

export interface DetailListItem {
  order_no: string
  order_time: string
  type: BillOrder_Type
  pay_after_state: BillOrder_PayAndAfterState
  outstock_price: string
  paid_amount: string
  unPay_amount: string
  order_after_sale_price: string
  settle_price: string
}
