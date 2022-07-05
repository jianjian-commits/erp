import { ReactNode } from 'react'
import { Image } from 'gm_api/src/common'
import type { UNIT_ENUM_TYPE } from './constants'
import { BasicPriceItem, Quotation_Type } from 'gm_api/src/merchandise'
export type { UNIT_ENUM_TYPE }

/** 报价单表单 */
export interface QuotaionFieldValues {
  inner_name: string
  outer_name: string
  description: string
  status: number
  type: Quotation_Type
  is_default: boolean
}

/** Select Options */
export interface Options {
  label: ReactNode
  value: string
}

/** 单位组 */
export interface UnitOptions {
  label: ReactNode
  /** 显示换算关系时使用 */
  name?: ReactNode
  value: string
  /** 单位类型，具体见 UNIT_ENUM */
  unit: UNIT_ENUM_TYPE
}

/** 报价单详情下 子母表 子表类型 */
export interface ChildrenType extends BasicPriceItem {
  /** 重要 */
  id: string
  order_unit_id: string
  /** 最小下单数 */
  minimum_order_number?: string | undefined
  fee_unit_price: {
    val: string
    unit_id: string
  }
  fee_unit_price_origin?: {
    val: string
    unit_id: string
  }
  /** 单位List */
  units: UnitOptions[]
  /** 上下架 */
  on_shelf: boolean
  current_price: boolean
  [key: string]: any
}

/** 报价单详情下 子母表 母表类型 */
export interface DataType {
  id: string
  name: string
  images?: Image
  type?: Quotation_Type
  customize_code?: string
  items: ChildrenType[]
  start_time?: string
  end_time?: string
  basic_price_id?: string
  sku_id?: string
}
