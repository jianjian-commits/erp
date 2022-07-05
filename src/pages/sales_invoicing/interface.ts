import {
  Shelf,
  StockSheet_SheetType,
  SkuStock,
  Batch,
  CustomerTurnover,
  ListSkuStockValueResponse_SkuStockValue,
} from 'gm_api/src/inventory'
import { LevelSelectDataItem, MoreSelectDataItem } from '@gm-pc/react'
import { Customer, GroupUser, Supplier } from 'gm_api/src/enterprise'
import {
  ListSkuResponse_SkuInfo,
  Sku,
  Ssu,
  UnitType,
  GetManySkuResponse_SkuInfo,
  UnitValue,
  SsuInfo,
} from 'gm_api/src/merchandise'
import { Route } from 'gm_api/src/delivery'
import { Processor } from 'gm_api/src/production'

export * as SalesInvoicingSheet from './sales_invoicing_type'

export interface PagingRequest {
  offset?: number
  limit: number
  need_count?: boolean
}

export interface TableRequestParams {
  [propName: string]: any
  paging: PagingRequest
}

export interface ReceiptStatus<T> {
  /** 待提交 */
  toBeSubmitted?: T
  /** 被反审，审核不通过 */
  cancelApproval?: T
  /** 被驳回 */
  notApproved?: T
  /** 已提交，待入库（审核） */
  submitted?: T
  /** 审核通过（如：已入库） */
  approved?: T
  /** 已删除 */
  deleted?: T
  // transfer?: T
  /** 分批入库 */
  split?: T
}

export interface ReceiptStatusAll<T> extends ReceiptStatus<T> {
  all?: T
}

export type ReceiptStatusAllKey = keyof ReceiptStatusAll<any>
export type ReceiptStatusKey = keyof ReceiptStatus<any>

export interface AdjustStatus<T> {
  all: T
  notSubmit: T // 未提交
  adjusting: T // 调整中
  done: T // 调整完成
}

export interface BatchType<T> {
  all: T
  const: T
  vir: T
}

export type AdjustStatusKey = keyof AdjustStatus<any>

export interface ObjectOfKey<T> {
  [key: number]: T
  [key: string]: T
}

export interface ReceiptType {
  purchaseIn: number
  productIn: number
  materialIn: number
  saleRefundIn: number
  otherIn: number
  saleOut: number
  materialOut: number
  purchaseRefundOut: number
  otherOut: number
  warehouseOut: number
  turnoverLoan: number
  turnoverRevert: number
  unspecified: number
  transfer: number
  allocationInventory: number // 调拨出库
  inventory: number
  transferIn: number
  transferOut: number
}

export interface ExportType {
  stockSheetList: number
  batch: number
  change: number
  purchaseIn: number
  saleOut: number
  materialOut: number
  materialIn: number
  productIn: number
  refoundIn: number
  otherOut: number
  otherIn: number
  increaseIn: number
  lossOut: number
  skuStock: number
  turnoverLog: number
  saleRefundIn: number
  transferIn: number
  transferOut: number
}

export type ReceiptTypeValue = StockSheet_SheetType.SHEET_TYPE_INVENTORY

export interface LogType {
  purchaseIn: number
  productIn: number
  materialIn: number
  refundIn: number
  increase: number
  otherIn: number
  transferIn: number

  saleOut: number
  materialOut: number
  refundOut: number
  loss: number
  otherOut: number
  transferOut: number

  purchaseInRollBack: number
  productInRollBack: number
  materialInRollBack: number
  otherInRollBack: number

  saleOutRollBack: number
  materialOutRollBack: number
  refundOutRollBack: number
  otherOutRollBack: number

  turnoverLoan: number
  turnoverRevert: number

  virtualIn: number
  virtualInRollBack: number

  allocateIn: number
  allocateOut: number
}
// 主要的进销存操作类型

// 列表信息
export interface StatisticalType {
  goodsItems: number
  stockMoney: number
  stockNumbers: number
  stockAverage: number
}

// 供应商结合moreSelect
export interface ComSupplier extends MoreSelectDataItem<string>, Supplier {}

// 供应商结合moreSelect
export interface ComPurchaser extends MoreSelectDataItem<string>, GroupUser {}

// 货位结合levelSelect
export interface ComShelf extends LevelSelectDataItem<string>, Shelf {}

// 客户结合moreSelect
export interface ComCustomer extends MoreSelectDataItem<string>, Customer {}

// 路线结合moreSelect
export interface ComRouter extends MoreSelectDataItem<string>, Route {}
export interface SsuItem extends Ssu {
  ssu_base_unit_id: string
  ssu_base_unit_name: string
  ssu_unit_id: string
  ssu_unit_name: string
  ssu_base_unit_rate: number
  ssu_unit_rate: number
  ssu_unit_type: UnitType
  ssu_display_name: string
}
export interface ComSkuItem extends MoreSelectDataItem<string>, SkuItem {}

export interface ComSsuItem extends MoreSelectDataItem<string>, SsuItem {}

export interface SkuItem extends Sku {
  _originalData: ListSkuResponse_SkuInfo // sku原数据

  ssu?: SsuItem[]

  sku_base_unit_id: string
  sku_base_unit_name: string
  spu_name: string
  category_id_1: string
  category_id_2: string
  category_name_1: string
  category_name_2: string
}

export interface ReceiptActionType extends ReceiptStatus<string> {
  print: string // 打印单据
  export: string // 导出单据
}

// 明细中的規格
export interface SkuUnitMoreSelect {
  text: string
  value: string
  isVirtualBase: boolean
}

// 明细中的商品选择
export interface SkuInfoMoreSelect
  extends Omit<SkuUnitMoreSelect, 'isVirtualBase'> {
  sku_type: number
  ssu: SkuUnitMoreSelect[]
}

export interface BatchExpand extends Batch {
  skuInfo: GetManySkuResponse_SkuInfo
  ssu_info?: SsuInfo
  shelfNames: string[] | void
  base_unit_name: string
  ssu_base_unit_name?: string
}
export interface SkuStockExpand extends SkuStock {
  base_unit_name?: string
  skuInfo?: GetManySkuResponse_SkuInfo
  children?: Batch[]
  batchArray?: string[]
}

export interface CustomerTurnoverExpand
  extends Omit<CustomerTurnover, 'stocks'> {
  stocks: CustomerTurnoverStock[]
  customer_id?: string
  customer_info: Customer
}

export interface UnitValueExpand extends UnitValue {
  ssu_price?: string
  total_price?: number
}
export interface CustomerTurnoverStock {
  sku_id: string
  skuInfo: SkuInfoExpand
  customer_id?: string
  customer_info: Customer
  base_unit: UnitValueExpand
  base_unit_name: string
}

export interface SkuInfoExpand extends Omit<GetManySkuResponse_SkuInfo, 'sku'> {
  sku: SkuExpand
  ssu_infos?: { [key: string]: SsuInfo }
}
export interface SkuExpand extends Sku {
  ssu_infos?: SsuInfo[]
}
export interface CustomerSheetType {
  customer?: MoreSelectDataItem<string>
  sku?: MoreSelectDataItem<string>
  quantity: number | null
  group_user_id: string
  base_unit_name: string
  related_sheet_serial_no?: string
  max?: number
  warehouse_id?: string
}

export interface CategoryType {
  category1_ids: SelectSingleOptions[]
  category2_ids: SelectSingleOptions[]
}
export interface SelectSingleOptions {
  value: string
  text: string
  children?: SelectSingleOptions[]
}

export interface StockValueExpand
  extends ListSkuStockValueResponse_SkuStockValue {
  sku_info: GetManySkuResponse_SkuInfo
  base_unit_name: string
  unit_id: string
  ssu_info: SsuInfo
  ssu_base_unit_name: string
  ssu_stock_list: Partial<StockValueExpand>[]
  warehouse_id?: string
}

export type LevelProcess = LevelSelectDataItem<string> & Processor

export type taxSupplierInfo = Record<string, string>
export interface TaxInfo {
  supplier_tax: taxSupplierInfo
  input_tax: string
  sku_id?: string
}

export interface TableColumns<D> {
  index: number
  original: D
}
