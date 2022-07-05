/** 编辑字段 - 数据类型 */
export const TABLE_TYPE = {
  /** 账单明细 */
  ORDERS: 'orders',
  /** 订单明细 */
  SKUS: 'skus',
  /** 商品汇总 */
  PRODUCT: 'product',
  /** 订单类型 */
  ORDER_TYPE: 'orderType',
} as const

const validType = [
  TABLE_TYPE.ORDERS,
  TABLE_TYPE.ORDER_TYPE,
  TABLE_TYPE.PRODUCT,
  TABLE_TYPE.SKUS,
]

export type TableType = typeof TABLE_TYPE[keyof typeof TABLE_TYPE]

/**
 * 判断是否为有效的 table 类型
 */
export const isValidTableType = (type?: string): type is TableType =>
  validType.includes(type as TableType)
