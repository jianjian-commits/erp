export interface Bill {
  customerId: string
  /** 客户编码 */
  customerCode: string
  /** 客户名称 */
  customerName: string
  /** 应付金额 */
  amountPayable: string
  /** 已付金额 */
  amountPaid: string
  /** 未付金额 */
  outstandingAmount: string
  /** 售后金额 */
  amountAfterSale: string
  /** 待结金额 */
  amountToBeSettled: string
}
