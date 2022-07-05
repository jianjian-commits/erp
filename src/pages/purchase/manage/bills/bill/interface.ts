import type {
  GetManyQuotationBasicPriceV2Request_SupplierSku,
  Sku,
} from 'gm_api/src/merchandise'
import {
  Sku_SupplierCooperateModelType,
  UnitValueSet,
  Sku_SkuLevel,
} from 'gm_api/src/merchandise'
import type {
  PurchaseSheet,
  PurchaseTask_RequestDetails_RequestDetail,
} from 'gm_api/src/purchase'
import type { MoreSelectDataItem } from '@gm-pc/react'
import { GroupUser, Supplier } from 'gm_api/src/enterprise'
import { StockSheet } from 'gm_api/src/inventory'

interface StockSheetItem extends StockSheet {
  supplierInfo: Supplier
  purchaserInfo: GroupUser
}
interface LevelData extends Sku_SkuLevel {
  text: string
  value: string
  disable: boolean
}
interface BillSku extends Partial<Sku> {
  _isOld?: boolean
  detail_id?: string // id
  raw_detail_id?: string
  receive_customer_id?: string
  purchase_amount?: number // 采购基本单位
  purchase_price?: number // 采购单价（计量单位）
  no_tax_purchase_price?: number // 不含税采购单价（计量单位）
  purchase_money?: number // 采购金额
  no_tax_purchase_money?: number // 不含税采购金额
  plan_amount?: string // 计划采购计量单位
  tax_money: number // 税额
  tax_rate: number // 税率
  remark?: string
  category_name: string
  manufacture_date: string
  purchase_unit_name?: string // 采购单位名字
  purchase_task_ids?: string[]
  purchase_task_serial_no?: string
  out_stock_unit_value?: UnitValueSet // 预计到货数（计量单位）
  supplier_cooperate_model_type?: Sku_SupplierCooperateModelType // 供应商协作模式
  up_relation?: Record<string, any[]>
  levelData: LevelData[] // 商品的等级的东西 需要带着
  sku_level_filed_id: string

  // plan_sale_amount?: string // 计划采购包装单位
  // out_stock_unit_value_pkg?: number // 预计到货数（包装单位）
  // ssu_unit_id?: string
  // ssuInfos: MoreSelectDataItem<string>[]
  // purchase_sale_amount?: number // 采购销售单位
  // _amount_edit_filed?: 'purchase_amount' | 'purchase_sale_amount'
}

interface BillInfo extends Omit<Partial<PurchaseSheet>, 'details'> {
  supplier: MoreSelectDataItem<string> | undefined
  purchase: MoreSelectDataItem<string> | undefined
  receive_time?: string
  creator?: GroupUser
  remark?: string
}
type SupplierTax = {
  [key: string]: string
}
/**
 * @description: 协议价tax,供应商tax,进项税率,sku_id,ssu_id
 */
interface MerchandiseInfo {
  supplier_tax?: SupplierTax | undefined
  input_tax?: string | undefined
  unit_id?: string
}

/**
 * @description: 协议价税率
 */
interface NegotiatedTax {
  negotiated_tax: string | undefined
  sku_id: string
  unit_id?: string
  // basic_price_id: string
}

/**
 * @description 关联计划的interface
 */
interface List extends Sku, PurchaseTask_RequestDetails_RequestDetail {
  unit_name?: string
  _index: number
  need: string
  customer_name: string
  levelName: string
}

export type {
  BillSku,
  BillInfo,
  MerchandiseInfo,
  NegotiatedTax,
  StockSheetItem,
  List,
}
