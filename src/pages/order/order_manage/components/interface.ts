import { ListDataItem } from '@gm-pc/react'
import {
  Customer as CustomerBase,
  ServicePeriod as SP,
  GroupUser,
  CustomerUser,
} from 'gm_api/src/enterprise'
import {
  Ssu as SsuBase,
  Sku as SkuBase,
  Quotation,
  BasicPrice,
  Ssu_Ingredients,
  UnitValueSet,
  UnitValueSetV2,
  Sku_SupplierCooperateModelType,
  Unit,
  BasicPriceItem,
  Ingredients,
  Menu,
} from 'gm_api/src/merchandise'
import { Order, OrderDetail } from 'gm_api/src/order'
import { SSuExtends } from '../../../../common/interface'
interface MoreSelectDataItem {
  value?: string
  text?: string
}
interface Customer extends CustomerBase, MoreSelectDataItem {
  service_periods?: SP[]
  quotation: Quotation
}

type ServicePeriod = SP

interface MenuSsu extends SsuBase, MoreSelectDataItem {}

interface Ssu extends SsuBase, MoreSelectDataItem, SSuExtends {
  category_name?: string
  isNewItem?: boolean
  price?: number
  packagePrice?: number
  quantity?: number | null
  real_quantity_fe?: number
  std_real_quantity_fe?: number
  basic_price?: BasicPrice
  remark?: string
  summary?: Omit<OrderDetail, 'ssu' | 'remark'>
  _editRealField?: 'real_quantity_fe' | 'std_real_quantity_fe'
  quotationName?: string
  sort_num?: number
  sorting_status?: number
  stdPrice?: number
  ssu_is_combine_ssu?: boolean
  feIngredients?: Ssu_Ingredients // 一份新的配比，用于可编辑
  has_after_sale: boolean
  detail_status?: string
  aftersale_price?: string
  return_refund_value?: UnitValueSet
  just_refund_value?: UnitValueSet
  selected?: boolean
  tax_price?: string // 税率
  inspection_id: string
  accept_value: UnitValueSet
  outstock_unit_value: UnitValueSet
  outstock_unit_value_v2: UnitValueSetV2
  original?: SsuBase
  order_detail_id?: string
  ingredientsInfo?: SsuBase[]
  parentId?: string
  base_quantity?: number
  base_real_quantity_fe?: number
  base_std_real_quantity_fe?: number
  supplier_cooperate_model_type?: Sku_SupplierCooperateModelType
}

interface Sku extends Omit<SkuBase, 'sku_id'>, OrderDetail, MoreSelectDataItem {
  /**
   * 下单数
   */
  quantity?: number | null
  /**
   * 单价(定价)
   */
  price?: string
  /**
   * 出库数
   */
  std_quantity?: number | null
  /**
   * 下单单位
   */
  unit_id?: string
  /**
   * 定价单位
   */
  fee_unit_id?: string
  minimum_order_number?: string | null
  parentId?: string
  ingredientsInfo?: SkuBase[]
  summary?: OrderDetail
  remark?: string
  std_real_quantity_fe?: number
  order_detail_id: string
  category_name?: string
  isNewItem?: boolean
  packagePrice?: number
  basic_price?: BasicPrice
  // _editRealField?: 'real_quantity_fe' | 'std_real_quantity_fe'
  quotationName?: string
  sort_num: string
  sorting_status?: number
  stdPrice?: number
  ssu_is_combine_ssu?: boolean
  feIngredients?: Ingredients // 一份新的配比，用于可编辑
  has_after_sale?: boolean
  detail_status?: string
  aftersale_price?: string
  return_refund_value?: UnitValueSet
  just_refund_value?: UnitValueSet
  selected?: boolean
  tax_price?: string // 税率
  inspection_id?: string
  accept_value?: UnitValueSet
  outstock_unit_value?: UnitValueSet
  outstock_unit_value_v2?: UnitValueSetV2
  original?: SkuBase
  base_quantity?: number
  // 新的出库数字段
  base_std_quantity?: number
  base_real_quantity_fe?: number
  base_std_real_quantity_fe?: number
  supplier_cooperate_model_type?: Sku_SupplierCooperateModelType
  unit?: Unit
  parentUnit?: Unit
  prices?: BasicPriceItem[]
  menu?: Menu
}
/**
 * 订单详情
 */
interface DetailListItem
  extends OrderDetail,
    Omit<SkuBase, 'sku_id' | 'units'> {
  /**
   * 下单数
   */
  quantity?: string | number
  /**
   * 单价(定价)
   */
  price?: string | number
  /** 不含税单价 */
  no_tax_price?: string | number
  /**
   * 非辅助单位出库数unitId
   */
  std_unit_id?: string
  /**
   * 辅助单位出库数unitId
   */
  std_unit_id_second?: string
  /**
   * 出库数（基本单位组，自定义单位）
   */
  std_quantity?: string | number
  /**
   * 辅助单位出库数
   */
  std_quantity_second?: string | number
  summary?: OrderDetail
  stdPrice?: string
  parentId?: string
  ingredientsInfo: DetailListItem[]
  isNewItem?: boolean
  quotationName?: string
  ingredients?: Ingredients
  feIngredients?: Ingredients // 一份新的配比，用于可编辑
  detail_status?: string
  base_quantity?: number
  // 新的出库数字段
  base_std_quantity?: number
  supplier_cooperate_model_type?: Sku_SupplierCooperateModelType
  /**
   * 当前下单单位结构
   */
  unit?: Unit
  units?: (Unit & ListDataItem<any>)[]
  parentUnit?: Unit
  prices?: BasicPriceItem[]
  menu?: Menu
  withoutInQuotations?: boolean
  category_name?: string
  minimum_order_number?: string
  /**
   * 复制订单用到
   */
  isDelete?: boolean
  /**
   * 是否开启辅助单位出库数
   */
  isUsingSecondUnitOutStock: boolean
  /** @description 是否是含有bom 如果有就是true 否则就是false */
  is_bom_type?: boolean
}

/**
 * 保存订单外层信息
 */
interface OrderInfo extends Omit<Order, 'receive_time'> {
  // order_id?: string | undefined
  customer: Customer | undefined
  receive_time?: string
  view_type: 'view' | 'create' | 'edit'
  service_period_id: string
  repair?: boolean
  group_users: { [key: string]: GroupUser }
  customer_users?: { [key: string]: CustomerUser }
  sign_img_url?: string
}

/** @description 非加工品的弹框数据interface */
interface NotProcessedData {
  /** 采购计划交期设置 */
  purchase_type: number
  // /** 采购设置分类交期 */
  // isSetClassify: boolean
  /** 采购计划波次  */
  purchase_batch: string
  /** 采购计划时间 */
  purchase_time: moment.Moment | undefined
  /** 供应商id */
  supplier_id: string
}
/** @description 加工品的弹框interface */
interface ProcessedData extends NotProcessedData {
  /** 生产计划模式设置 */
  production_merge_mode: number
  /** 生产单品BOM计划交期设置 */
  production_cleanfood_type: number
  /** 生产组合BOM计划交期设置 */
  production_type: number
  /** 生产计划单品BOM波次 */
  production_cleanfood_batch: string
  /** 生产计划组合BOM波次 */
  production_batch: string
  /** 生产组合BOM交期时间 */
  production_time: moment.Moment | undefined
  /** 生产单品BOM交期时间 */
  production_cleanfood_time: moment.Moment | undefined
  /** 包装计划交期设置 */
  pack_type: number
  /** 包装计划模式设置 */
  pack_merge_mode: number
  /** 包装计划波次 */
  pack_batch: string
  /** 包装计划时间 */
  pack_time: moment.Moment | undefined
}

export type {
  DetailListItem,
  Customer,
  ServicePeriod,
  Ssu,
  Sku,
  MenuSsu,
  OrderInfo,
  ProcessedData,
  NotProcessedData,
}
