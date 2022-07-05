export interface ProductSummaryItem {
  /** 商品 id */
  skuId?: string
  /** 商品编码 */
  customizeCode?: string
  /** 商品名称 */
  skuName?: string
  /** 商品单价（均值） */
  skuPriceAverage?: string
  /** 商品分类 */
  category?: string
  /** 定价单位 */
  feeUnit?: string
  /** 定价单位 id */
  feeUnitId?: string
  /** 下单数 */
  orderQuantity?: string
  /** 下单单位 */
  orderUnit?: string
  /** 下单单位 id */
  orderUnitId?: string
  /** 下单金额 */
  orderAmount?: string
  /** 出库数 */
  outstockQuantity?: string
  /** 出库单位 */
  outstockUnit?: string
  /** 出库单位 id */
  outstockUnitId?: string
  /** 出库金额 */
  outstockAmount?: string
}
