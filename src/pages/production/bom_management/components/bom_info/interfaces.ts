/**
 * BOM的查询语句，用于url
 */
interface BomQuery {
  /** BOM的ID */
  bom_id: string
  /** BOM关联商品的ID */
  sku_id: string
  /** BOM版本 */
  revision: string
  /** 包装 */
  isPack: string
}

export type { BomQuery }
