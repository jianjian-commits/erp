import { ReactElement, ReactNode } from 'react'
import { UploaderFile } from '@gm-pc/react'
import {
  Quotation,
  Ssu,
  Sku,
  Ssu_Ingredients_SsuRatio,
  Unit,
  GetManyReferencePriceResponse,
  SsuInfo,
  Sku_SupplierCooperateModelType,
} from 'gm_api/src/merchandise'
import { Bom, ListProduceBomResponse } from 'gm_api/src/production'
import { Ssu_Ingredients, UnitValue } from 'gm_api/src/merchandise/types'
import type { UnitGlobal } from '@/stores/global'
import Big from 'big.js'
import type { MoreSelectDataItem } from '@gm-pc/react'

export interface PackageOptions {
  sku_id: string
  unit_id: string
}

export interface ImageOptions {
  url: string
  width?: number
}

export interface BasicPriceOptions {
  basic_price_id: string
  sku_id: string
  unit_id: string
  quotation_id: string
  quotation_name: string
  current_price: boolean
  price: number | string
  sale_price: number | string
  rate: number
}

export interface BomOptions extends Bom {
  bom_id: string
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
        inputs: [
          {
            material: {
              sku_id: string
              unit_id: string
              name: string
              sku_type: number | string
              not_package_sub_sku_type: number | string
              package_sub_sku_type: number | string
              quantity: number | string
              property: number
              search_unit_id: string
              production_unit: Unit
              process?: boolean
            }
          },
        ]
        outputs: [
          {
            type: number
            material: {
              sku_id: string
              unit_id: string
              quantity: number
              property: number
            }
          },
        ]
      },
    ]
    latest_process_id: number
  }
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
  supplier_cooperate_model_type: Sku_SupplierCooperateModelType // 供应商协作模式
}

export interface SsuRatio extends Ssu_Ingredients_SsuRatio {
  name: string
  base_unit_id: string
  unit_ids: UnitGlobal[]
  material_cost?: UnitValue
  materialRateCost: number | Big
}

export interface Ingredients extends Ssu_Ingredients {
  ssu_ratios?: SsuRatio[]
}

export interface SsuOptions extends Ssu {
  unit_id: string
  unit_id_for_sale: string // 销售计量单位id
  unit_name_for_sale: string // 销售计量单位name
  sku_id: string
  name: string
  customize_code: string
  description: string
  on_sale: boolean
  is_weight: boolean
  shipping_fee_unit_id: string // 定价方式 计价单位unit_id
  shipping_fee_unit: number // 定价方式 1-按计量单位 2-按包装单位
  images: string[]
  unit: {
    parent_id: string
    unit_type: number
    rate: string
    unit_name?: string
    sale_unit_name?: string
    unit_id: string
    name: string
  }
  purchaseSpec: {
    create: boolean // true-新建采购规格 false-选择已有采购规格
    purchase_unit_id: string
    create_type: number // 1-按计量单位 2-自定义
    rate: number | string
    unit_name: string
    sale_unit_name: string
    pur_unit_id_for_sale: string
    pur_unit_name_for_sale: string
  }
  need_package: boolean // 是否打包
  need_package_work: boolean // 是否进入打包作业流程
  package_ssu_id: string
  package_id: PackageOptions
  package_calculate_type: number // 换算方式
  package_num: number | string // 包材数量
  basic_prices: BasicPriceOptions[]
  default_price?: number | null // 菜谱单价
  ingredients?: Ingredients
  total_price: string // 组合商品总价
  loss_ratio: number // 耗损比例
}

export interface SpecTabOptions {
  tabs: string[]
  onChange?(tab: string, index: number): void
  className: string
  active: number
  children: ReactElement[]
}

export interface GroupOptions {
  title: string
  info: string
}

export interface SpecGroupItemOptions {
  title: string
  info: string
  group: GroupOptions
  active: boolean
  onMore(): void
  onClick(): void
  index: number
  popup(): void
}

export interface SpecGroupOptions {
  className?: string
  active: number
  popup(index: number): void
  onChange(index: number): void
  group: GroupOptions[]
}

export interface CategoryOptions {
  category_id: string
  parent_id: string
  name: string
  icon: string
  rank: number
}

export interface CategoryIconOptions {
  id: string
  url: string
  selected?: boolean
}

export interface AddCategory1Options {
  icons: CategoryIconOptions[]
  name?: string
  icon?: string
  onChange(id: string): void
  onSelected(id: string | null): void
}

export interface IconOptions {
  type: number
  image: string
  url: string
  id: number
  selected?: boolean
}

export interface IconsManagementOptions {
  onOk(): void
  icons: IconOptions[]
}

export interface DefaultIconOptions {
  id?: number
  name?: string
}

export interface SystemIconsOptions {
  icons: IconOptions[]
  onSetDefault(id: number): void
}

export interface SystemIconOptions {
  icon: IconOptions
  onClick(id: number): void
}

export interface LocalIconsOptions {
  icons: string[]
  handleUpload(data: UploaderFile[]): Promise<string[]>
  handleDelete(data: string): void
}

export interface treeOptions {
  icon: number
  id: string
  category_id: string
  level: number
  name: string
  value: string
  parent?: string
  parent_id?: string
  title: string
  children: treeOptions[]
  actions: any
  edit: any
  addRef: any
  deleteRef: any
  highlight: boolean
  loading: boolean
  showSort: boolean
  checked: boolean
  expand: boolean
}

export interface treeListOptions {
  treeData: treeOptions[]
  checkList: string[]
  checkData: treeOptions[]
  noDataText: string
  onCheck(): void
  onExpand(): void
  onMove(): void
  onSort(): void
  onClearHighlight(): void
}

export interface treeNodeOptions {
  value: treeOptions
  treeData: treeOptions[]
  noDataText: string
  onCheck(value: {
    checked: boolean
    value: treeOptions | null
    checkList: string[]
  }): void
  onExpand(value: { expand: boolean; value: treeOptions }): void
  onSort(): void
  onClearHighlight(): void
}

export interface checkNumberOptions {
  data: treeOptions[]
  handleMoveCategory(): void
}

export interface moveModalOptions {
  data: treeOptions[]
  onMove(value: {
    category_id_1: string
    category_id_2: string
    pinlei_id: string
  }): void
}

export interface itemEditOptions {
  icons: IconOptions[]
  value: treeOptions
  onOk(value: treeOptions, name: string, icon: any): void
  onHighlight(value?: boolean): void
}

export interface editOptions extends itemEditOptions {
  container: any
}

export interface itemActionOptions {
  value: treeOptions
  onCreateSpu(): void
  onChangeName(): void
  onAddSubclass(): void
  onHighlight(): void
  renderDelete(): void
}

export interface popConfirmOptions {
  title: string
  value: treeOptions
  content: ReactNode
  onOkText: string
  onOkType: string
  onOk(): void
  onHighlight(): void
}

export interface AddSubclassInputOption {
  onChange(value: string): void
}

export interface keyboardTableCellOptions {
  index: number
}

export interface QuotationOptions extends Quotation {
  value: string
  text: string
}

export interface StockOptions {
  stock_type: number // 设置库存
  sale_stocks: number | string // 可销售库存
}

export interface CombineListFilterOptions {
  q: string
  status: string
}

export interface OptionResponse {
  materialCost?: GetManyReferencePriceResponse
  produceBom?: ListProduceBomResponse
  [key: number]: any
}

export interface ListSkuType extends Sku, MoreSelectDataItem<string> {
  ssu_infos: SsuInfo[]
}
