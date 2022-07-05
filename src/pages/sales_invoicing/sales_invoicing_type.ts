import {
  StockSheet,
  Batch,
  StockSheet_Detail,
  Shelf,
} from 'gm_api/src/inventory'

import {
  DiscountState,
  ApportionState,
} from '@/pages/sales_invoicing/components'
import { ComSsuItem, taxSupplierInfo } from './interface'
import { Task } from 'gm_api/src/production'
import { UnitType } from 'gm_api/src/merchandise'

// 管理进销存单据的数据类型

// 单据详情
interface ReceiptDetail extends Omit<StockSheet, 'details'> {
  details: ProductDetail[]
  discountList?: Discount[]
  apportionList?: Apportion[]
  turnoverList?: ProductDetail[]
  target_name?: string
  creator_name?: string
  target_delete_time: string
  target_customized_code?: string
  target_attrs_invoice_type?: number
  originalStockSheet?: StockSheet
  purchaser_id?: string
  purchaser_name?: string
  supplier_name?: string
  supplier_delete_time?: string
  purchaser_delete_time?: string
  processor_ids: string[]
  warehouse_id?: string
  warehouse_name?: string
}

interface StockInReceiptDetail extends Omit<ReceiptDetail, 'details'> {
  details: StockInProductDetail[]
}

// 入库详情即是一条批次，因此继承批次声明
interface StockInProductDetail extends ProductDetail, Omit<Batch, 'batch_id'> {
  batch_id?: string
  shelf_selected: string[]
  shelf?: Shelf
  module?: number // 关联对象的选择
  supplier_taxs?: taxSupplierInfo
}

interface StockOutReceiptDetail extends Omit<ReceiptDetail, 'details'> {
  details: StockOutProductDetail[]
}

interface StockOutProductDetail extends ProductDetail {
  batch_selected: BatchDetail[]
  shelf_id?: string // 退料入库
}

// 商品详情
interface ProductDetail
  extends Omit<StockSheet_Detail, 'amount' | 'spu_id' | 'base_unit_id'> {
  // sku
  sku_name: string
  sku_base_unit_id: string
  sku_base_unit_name: string
  sku_type: number
  base_unit_id: string
  // // 商品分类
  // category_id_1: string
  // category_id_2: string
  // category_name_1: string
  // category_name_2: string
  spu_id: string
  spu_name: string

  // ssu
  // ssu_unit_id: string
  // ssu_unit_name: string

  // ssu_unit_type: UnitType // 对应ssu下的unit_type

  // ssu_base_unit_id: string
  // ssu_base_unit_name: string

  // ssu_base_price: number | null

  // ssu_base_quantity: number | null
  // ssu_quantity: number | null

  // ssu_base_unit_rate: number | null // 对应ssu基准单位和sku基本单位的换算比例
  // ssu_unit_rate: number | null // 对应ssu自定义单位和ssu基准单位的换算比例

  // ssu: ComSsuItem[] // ssu list
  unit_id: string // ssu 标识规格id,与ssu_unit_id一致
  // ssu_display_name: string

  // 做显示处理，后台需要8位，前端需要展示的会变，因此单独取一个变量来控制展示，数据运算流转用没有show的字段
  amount_show: null | string | number // 金额
  // base_quantity_show: null | string | number // 基本单位
  // ssu_quantity_show: null | string | number // 包装单位(废弃)
  // ssu_base_price_show: null | string | number // 基本单位单价
  // different_price_show: null | string | number // 补差

  different_price: number | null
  operator_name: string
  production_time?: string
  amount: number | null
  shelf_name?: string

  target_customer_name?: string
  target_route_name?: string
  no_tax_base_price: number | null
  no_tax_amount: number | null
  tax_money: number | null
  tax_rate: number
  transfer_measure: number
  transfer_package: number
  transfer_shlef: Array<string>
  value: string

  base_quantity: number | null
  base_price: number | null
  base_quantity_show: null | string | number // 入库数量基本单位
  base_price_show: null | string | number // 入库单价基本单位
}

interface PlanStockInReceiptDetail
  extends Omit<StockInReceiptDetail, 'details' | 'turnoverList'> {
  details: PlanStockInProductDetail[]
  // turnoverList: PlanStockInProductDetail[]
}

type PlanStockInProductDetail = StockInProductDetail

interface RefundPlanStockInReceiptDetail
  extends Omit<StockInReceiptDetail, 'details' | 'turnoverList'> {
  details: RefundPlanStockInProductDetail[]
  // turnoverList: PlanStockInProductDetail[]
}

interface RefundPlanStockInProductDetail extends StockInProductDetail {
  batch_selected: BatchDetail[]
}

interface PlanStockOutReceiptDetail
  extends Omit<StockInReceiptDetail, 'details' | 'turnoverList'> {
  details: PlanStockOutProductDetail[]
  // turnoverList: PlanStockOutProductDetail[]
}

interface PlanStockOutProductDetail extends StockOutProductDetail {
  batch_selected: BatchDetail[]
}

interface BatchDetail extends Batch {
  batch_average_price: number | null
  batch_delete_time: string
  shelf_name?: string
  ssu_quantity: number | null
  sku_base_quantity: number | null
  sku_base_quantity_show?: number | string | null
  ssu_quantity_show?: string | number | null
  ssu_stock_quantity: string
  sku_stock_base_quantity: string
  ssu_unit_name: string
  sku_base_unit_name: string
  sku_base_unit_id: string
  ssu_unit_id: string
  ssu_display_name: string

  ssu_base_unit_rate: number
  ssu_unit_rate: number

  update_price?: boolean // 来自update_batch
  origin_create_batch?: Batch

  target_customer_name?: string
  target_route_name?: string
}

// 折让
interface Discount extends DiscountState {
  creator_id?: string
  create_time?: string
}

// 分摊
interface Apportion extends ApportionState {
  creator_id?: string
  create_time?: string
}

// 生产计划
type TaskDetail = Task

interface SkuSelectedDetail {
  // sku
  sku_name: string
  sku_base_unit_id: string
  sku_base_unit_name: string
  sku_type: number
  // 商品分类
  category_id_1: string
  category_id_2: string
  category_name_1: string
  category_name_2: string

  sku_id: string
  spu_id: string
  spu_name: string

  ssu: ComSsuItem[] // ssu list
}

// common 作为统一单据类型，取代之前不同类型控制不同单据的情况，和后台对齐，单据就一个类型就好
interface commonProductDetail extends ProductDetail {
  batch_selected?: BatchDetail[]
  shelf_selected?: string[]
  shelf?: Shelf

  // batch
  batch_serial_no?: string

  ssu_customized_code?: string
  ssu_name?: string
  sku_customized_code?: string
  // 调拨单掉入货位
  trans_in_shelf_name?: string
  // 调拨单掉出货位
  trans_out_shelf_name?: string
  // 保质期
  sku_expiry_date?: number
  // 批次
  additional_batches_items?: Record<string, any>
}

interface CommonReceiptDetail extends Omit<ReceiptDetail, 'details'> {
  details: commonProductDetail[]
}

export type {
  ReceiptDetail,
  StockInReceiptDetail,
  StockInProductDetail,
  StockOutReceiptDetail,
  StockOutProductDetail,
  PlanStockInReceiptDetail,
  PlanStockInProductDetail,
  RefundPlanStockInReceiptDetail,
  RefundPlanStockInProductDetail,
  PlanStockOutReceiptDetail,
  PlanStockOutProductDetail,
  ProductDetail,
  BatchDetail,
  Discount,
  Apportion,
  TaskDetail,
  SkuSelectedDetail,
  CommonReceiptDetail,
  commonProductDetail,
}
