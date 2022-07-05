export interface CustomizeOrderTypeAmount {
  /** 下单金额 */
  orderAmount?: string
  /** 出库金额 */
  outstockAmount?: string
}

export interface OrderTypeSummaryItem {
  id?: string
  /** 下单日期（按天） */
  orderDate?: string
  /** 下单总金额 */
  totalOrderAmount?: string
  /** 出库总金额 */
  totalOutstockAmount?: string
  /** 自定义订单类型的数据 */
  customizeOrderType: Record<string, CustomizeOrderTypeAmount>
  [propKey: string]: unknown
}
