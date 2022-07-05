import {
  Quotation,
  MenuPeriodGroup,
  MenuDetail,
  Ssu,
  BasicPrice,
  Sku,
  Ssu_Ingredients,
  Sku_SkuType,
  Ingredient as RawIngredient,
  BasicPriceItem,
} from 'gm_api/src/merchandise'
import { ServicePeriod } from 'gm_api/src/enterprise'
import { UnitOptions } from '@/pages/merchandise/price_manage/customer_quotation/data'
import type { ReactNode } from 'react'

export interface MenuDetailItem {
  /** 接口获取到的价格信息 */
  rawBasicPrice?: Readonly<BasicPrice>
  selected?: boolean
  /** 商品 id */
  sku_id?: string
  /** 商品类型 */
  sku_type?: Sku_SkuType
  /** 商品名称 */
  name?: string
  /** （定价单位）当前选择的单位 id */
  fee_unit_id?: string
  /** 下单单位 */
  unit_id?: string
  /** 当前选择的单位 */
  unit?: UnitOptions & { text: ReactNode }
  /** 单位列表 */
  units?: Array<UnitOptions & { text: ReactNode }>
  /** 价格 */
  price?: number | string
  /** 组合商品原料 sku */
  ingredientsInfo?: Ingredient[]
  /** 子商品配比 */
  ingredient?: RawIngredient[]
  /** 备注 */
  remark?: string
  /** sku_id  Select 组件使用 */
  value: string
  /** sku name Select 组件使用 */
  text: string
  /** 餐次id */
  menu_period_group_id?: string
}

export type Ingredient = Omit<
  MenuDetailItem,
  'ingredientsInfo' | 'rawBasicPrice'
> & {
  /** 接口获取到的价格信息 */
  rawBasicPrice?: Readonly<BasicPriceItem>
  /** 子商品配比 */
  ratio: string
  /** 用于页面编辑组合商品原料时使用 */
  skuIndex: number
}

export interface QuotationInfo extends Quotation {
  valid_start?: string
  valid_end?: string
}

// @ts-ignore
export interface MenuPeriodGroupProps extends MenuPeriodGroup, ServicePeriod {}

export interface FilterProps {
  quotation_id: string
  menu_from_time: string
  menu_to_time: string
  valid_begin: string
  valid_end: string
  source: string
}

// ssu + basic_price + sku + price
// @ts-ignore
export interface MenuDetailItemSsuProps extends Ssu, Sku, BasicPrice {
  selected: boolean
  original_ingredients?: Ssu_Ingredients
  original_ssu?: Ssu // 需要原始数据回传后台
}

export interface ServicePeriodInfoProps extends MenuPeriodGroupProps {
  details: MenuDetailItem[]
}

export interface MenuDetailItemDetailsItemProps {
  service_period_infos: ServicePeriodInfoProps[]
}

export interface MenuDetailItemProps extends MenuDetail {
  selected: boolean
  menu_status: string
  details: MenuDetailItemDetailsItemProps
}

export interface EditStatusProps {
  [key: string]: boolean
}

export interface KeyboardTableCellOptions {
  mealIndex: number
  ssuIndex: number
  editStatus: EditStatusProps
}

export interface KeyboardTableChildCellOptions {
  mealIndex: number
  ssuIndex: number
  bomIndex: number
  editStatus?: EditStatusProps
}
