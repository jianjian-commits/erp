import { UnitGlobal } from '@/stores/global'
import { ListDataItem, MoreSelectDataItem } from '@gm-pc/react'
import Big from 'big.js'
import {
  CategoryInfo,
  Sku,
  Sku_NotPackageSubSkuType,
  Ssu,
} from 'gm_api/src/merchandise'
import {
  Attr,
  Bom,
  BomType,
  Bom_Process,
  Bom_Process_Input,
  Bom_Process_Material,
  ProcessTemplate,
} from 'gm_api/src/production'

/**
 * BOM的工序
 * @extends Omit<Bom_Process, 'attrs' | 'inputs' | 'outputs'>
 * @extends Omit<ProcessTemplate, 'attrs' | 'name' | 'customized_code'>
 */
interface ProcessOfBom
  extends Omit<Bom_Process, 'attrs' | 'inputs' | 'outputs'>,
    Omit<ProcessTemplate, 'attrs' | 'name' | 'customized_code'> {
  /** 工序的参数 */
  attrs: (Attr & { val?: string })[]
  /** 工序投入 */
  input_quantity?: number
  /** 工序产出 */
  output_quantity?: number
  /** 出成率 */
  process_yield?: number | null
  /** 选择的工序 */
  selectProcess?: MoreSelectDataItem & { isDelete?: boolean }
  /** 排序 */
  sortNum?: string
}

/**
 * 原料条目
 * @extends Bom_Process_Material
 * @extends Omit<Bom_Process_Input, 'material'>
 */
interface MaterialItem
  extends Bom_Process_Material,
    Omit<Bom_Process_Input, 'material'> {
  /** 工序 */
  processes?: ProcessOfBom[]
  /** 商品名 */
  sku_name?: string
  /** 商品自定义编码 */
  customize_code?: string
  /** 物料可选基本单位列表 */
  unit_ids?: UnitGlobal[]
  /** 物料基本单位 */
  base_unit_id: string
  /** 出成率 单品BOM */
  process_yield?: number | null
  /** 换算后的成本 */
  materialRateCost?: number | Big
  /** 商品信息 */
  skuInfo?: Sku
  /** 非包装商品的种类 */
  not_package_sub_sku_type?: Sku_NotPackageSubSkuType
  /** 是否是成品一栏的数据 */
  isFinishedProduct?: boolean
  /** 原料BOM */
  materialBom?: Bom
  /** 排序 */
  sortNum?: string
}

/**
 * 客户参数
 */
interface CustomerAttrs {
  /** 上级客户 */
  parent_ids: string[]
  /** 标签 */
  tags: string[]
}

/**
 * 客户
 */
interface Customer {
  /** 客户的ID */
  customer_id: string
  /** 上级客户 */
  parent_id: string
  /** 客户名 */
  name: string
  /** 客户的参数 */
  attrs?: CustomerAttrs
}

/**
 * 副产品
 */
interface ByProducts {
  /** 商品的ID */
  sku_id: string
  /** 基本单位 */
  base_unit_id: string
  /** 数量 */
  value: string
  /** 文本 */
  text: string
  /** 商品名 */
  name: string
}

/**
 * 选择的商品
 * @extends MoreSelectDataItem<string>
 */
interface SelectedSku extends MoreSelectDataItem<string> {
  /** 基本单位 */
  base_unit_id?: string
  /** 选择的规格 */
  selectSsu?: MoreSelectDataItem<string>
  /** 原始数据 */
  original: Sku & { ssu_infos?: Ssu; category_infos?: CategoryInfo[] }
}

/**
 * BOM详情
 * @extends Bom
 */
interface BomDetail extends Bom {
  /** 设置bom时存储当前选择副产品 */
  by_products: ByProducts[]
  /** 设置bom时存储当前组合工序 */
  combine_processes: Omit<ProcessOfBom, 'customized_code'>[]
  /** 设置bom时所在sku可换算的units */
  unit_ids: ListDataItem<string>[]
  /* 区分原始是否默认bom状态 */
  original_status: number
  /* 是否展示熟出成相关 */
  showYield?: boolean
  /** BOM的种类 */
  type: BomType
  /* 成品相关 */
  selectedSku?: SelectedSku
}

interface SortNum {
  materialNum: number
  processNum: number
}

export type {
  ByProducts,
  BomDetail,
  Customer,
  ProcessOfBom,
  MaterialItem,
  SelectedSku,
  SortNum,
}
