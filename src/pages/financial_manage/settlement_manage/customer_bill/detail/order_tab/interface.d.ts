import { BillOrder_PayAndAfterState, BillOrder_Type } from 'gm_api/src/finance'

export interface OrderSummaryItem {
  /** 账单 id */
  billOrderId: string
  /** 订单号 */
  orderNumber?: string
  /** 售后单号 */
  afterSaleNumber?: string
  /** 下单时间 */
  orderTime?: string
  /** 收货时间 */
  receivingTime?: string
  /** 业务类型 */
  businessType?: BillOrder_Type
  /** 订单类型 */
  orderType?: string
  /** 支付状态/售后状态 */
  status?: BillOrder_PayAndAfterState
  /** 应付金额 */
  amountPayable?: string
  /** 已付金额 */
  amountPaid?: string
  /** 未付金额 */
  outstandingAmount?: string
  /** 售后金额 */
  amountAfterSale?: string
  /** 售后订单列表 */
  children?: OrderSummaryItemChild[]
}

export type OrderSummaryItemChild = Omit<OrderSummaryItem, 'children'>
