/**
 * 路由参数
 */
export interface SearchParams {
  customerId?: string
  order_time_from_time?: string
  order_time_to_time?: string
  order_receive_from_time?: string
  order_receive_to_time?: string
  order_outstock_from_time?: string
  order_outstock_to_time?: string
}

/** 时间筛选参数 */
export type SearchTimeParams = Omit<SearchParams, 'customerId'>

export interface BillInfo {
  /** 客户 id */
  customerId: string
  /** 客户名称 */
  customerName?: string
  /** 客户编码 */
  customerCode?: string
  /** 应付金额 */
  amountPayable?: string
  /** 已付金额 */
  amountPaid?: string
  /** 未付金额 */
  outstandingAmount?: string
  /** 售后金额 */
  amountAfterSale?: string
  /** 待结金额 */
  amountToBeSettled?: string
}
