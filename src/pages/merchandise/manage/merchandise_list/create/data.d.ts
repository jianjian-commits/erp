import {
  Bom,
  Bom_Process_Input,
  Bom_Process_Material,
} from 'gm_api/src/production'
import {
  Quotation,
  Sku_NotPackageSubSkuType,
  Unit,
  Sku,
  BasicPrice,
  SsuInfo,
  Sku_SupplierCooperateModelType,
} from 'gm_api/src/merchandise'
import type { MoreSelectDataItem } from '@gm-pc/react'

// 图片的interface
import Big from 'big.js'
export interface ImageOptions {
  url: string
  width?: number
}
export interface UnitGlobal extends Unit {
  value: string
  text: string
  parent_id: string
  rate: string
}

export interface UnitItem extends Unit {
  [props: string]: any
}

export interface SkuItem extends Sku {
  [props: string]: any
}
// 树形结构
export interface Categories {
  category_id?: string
  spu_id?: string
  text?: string
  value?: string
  status?: string
  level?: number
  revision?: string
  create_time?: string
  update_time?: string
  delete_time?: string
  group_id?: string
  parent_id?: string
  name?: string
  icon?: string
  rank?: number
  children?: Categories[]
}

// 树形结构map类型
export interface MapItem {
  [key: string]: Categories
}

export interface BomItem {
  material: {
    sku_id: string
    unit_id: string
    name: string
    sku_type: string
    not_package_sub_sku_type: string
    package_sub_sku_type: string
    quantity: string
    base_unit_id?: string
    property: number
    skuSelect: Sku[]
    unitList: UnitItem[]
    isProcess?: boolean // 是否是加工sku的第一个物料
  }
  prev_process_id: string
}

export interface BaseInfo {
  selectClassify: string[] // 类型选择
  name: string // 商品名字
  not_package_sub_sku_type?: Sku_NotPackageSubSkuType | string // 商品类型
  customize_code: string // 自定义编码
  alias: string[] // 商品别名
  expiry_date: number | string // 保质期:
  images: ImageOptions[] // 商品图片
  desc: string // 商品描述
  [propName: string]: any
}
export interface ProductBomMessage {
  process: boolean // 0否，1是
  process_type: number // 0是净菜，1是熟菜
  [propName: string]: any
}

export interface SupplyChainInfo {
  supplier_id: any | undefined
  purchaser_id: any | undefined
  purchase_method_type: string | number // 采购方式数据
  purchase_spec_id: string | number
  purchasingUnitData: any[] // 采购单位数据源
  production_unit: UnitItem
  manual_purchase: boolean
  loss_ratio: string
  [propName: string]: any
  supplier_cooperate_model_type?: Sku_SupplierCooperateModelType // 供应商协作模式
}

interface MaterialExpandType extends Bom_Process_Material {
  [propName: string]: any
  materialRateCost: number | Big
}
interface BomInput extends Bom_Process_Input {
  [propName: string]: any
  material: MaterialExpandType
}

export interface SsuAndQuotation {
  name: string // 规格名字
  unit: UnitItem // 选择规格
  unit_type: number // 选择的销售规格
  saleUnitSelect?: string // 修改规格单位
  saleValue?: number // 修改销售单位的数值
  saleUnitSelectOther?: string // 选择的销售规格第二个单位根据库存变以及最小单位数 默认等于销售规格
  customize_code: string // 规格编码
  on_sale: boolean // 上架状态
  minimum_order_number: number // 最小单位数
  is_weight: boolean // 计重方式
  shipping_fee_unit: number // 定价方式
  stock_type: number // 销售库存
  sale_stocks: number // 销售库存
  predefinedValue: number // 销售库存
  default_price: number | string // 菜谱单价
  images: ImageOptions[] // 商品图片
  basic_prices: GoodsDetail[] // 商品图片
  bom: BomInput[]
  description: string // 规格描述
  need_package: boolean // 包材设置
  need_package_work: boolean // 是否打包
  package_price: string // 是否打包
  package_ssu_id: any | undefined // 选择包材
  package: any // 选择包材
  package_calculate_type: number // 换算方式
  package_num: number // 数量
  [propName: string]: any
}
export interface GoodsDetail {
  quotation_id: any | undefined
  sale_price: string
  price: string
  current_price: boolean
  [propName: string]: any
}
export interface QuotationOptions extends Quotation {
  value?: string
  text?: string
}

export interface FinancialTaxInfo {
  finance_category_id: any // 选择财务税收信息
  tax: string | number // 销项税率
  input_tax: string | number // 进项税率
  [propName: string]: any
}

export interface SsuSalesUnit {
  _rate: string | number
  saleUnitList: any[]
}
export interface SkuOptions extends Sku {
  name: string
  sku_id: string
  customize_code: string
  desc: string
  category_id_1: string
  category_id_2: string
  category_name_1: string
  category_name_2: string
  spu_id: string
  spu_name: string
  base_unit_id: string // 基本单位
  unit_name: string
  sku_type: number // 商品类型 1-包材 2-非包材
  not_package_sub_sku_type?: number // 非包材 1-毛菜 2-净菜加工
  package_sub_sku_type?: number // 包材 1-周转物 2-耗材
  process?: boolean // 是否开启加工
  _process?: boolean // 修改中判断是否开启过加工
  alias: string[]
  images: ImageOptions[]
  purchase_type: number // 采购类型 1-非临采 2-临采
  purchaser_id?: string // 采购id
  supplier_id?: string // 供应商id
  package_price?: string // 货值
  stock?: number // sku库存,ssu设置库存方式的时候用到
  expiry_date: number | string // 保质期
  finance_category_id: string
  tax: number
  process_type: number // 加工类型
  input_tax: number
}

export interface BasicPriceItem extends BasicPrice {
  [propName: string]: any
}

export interface BomOptions extends Bom {
  bom_id?: string
  sku_id: string
  unit_id: string
  name: string
  customized_code: string
  type: number // bomType 1-生产bom 2-包装bom
  base_unit_id: string
  quantity: number | string
  processes: {
    processes: [
      {
        process_id: number
        process_template_id: string
        inputs: any
        outputs: [
          {
            type: number
            material: {
              sku_id: string
              unit_id: string
              quantity: string
              property: number
            }
          },
        ]
      },
    ]
    latest_process_id: number
  }
}

export interface SkuMoreSelect extends MoreSelectDataItem<string> {
  ssu_infos?: SsuInfo[]
}
