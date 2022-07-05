import { ModelConfig } from '@antv/g6'

/**
 * BOM流程图中商品卡片组件的属性
 */
interface CardConfig extends ModelConfig {
  /** 商品名称 */
  name?: string
  /** 商品数量 */
  amount?: number
  /** 商品单位 */
  unit?: string
  /** 商品成本 */
  cost?: number
  /** 成本单位 */
  cost_unit?: string
  /** 是否显示数量 */
  showAmount?: boolean
  /** 是否显示成本 */
  showCost?: boolean
}

/**
 * BOM流程图中工序组件的属性
 */
interface ProcessConfig extends ModelConfig {
  /** 工序名称 */
  name?: string
  /** 组件菱形的尺寸，可统一或分别设置半横轴与半纵轴的长度 */
  diamondSize?: number | number[]
  /** 组件菱形间的间距，适用于多道工序（并非组合工序） */
  diamondMargin?: number
  /** 总出成率，适用于多道工序（并非组合工序） */
  yieldRate?: string
  /** 子工序，适用于多道工序（并非组合工序） */
  processes?: ProcessConfig[]
  /** 是否显示出成率 */
  showYieldRate?: boolean
}

/**
 * BOM流程图中商品的属性
 */
interface Item {
  /** Bom的ID，只有成品和子BOM才有，原料和副产品没有 */
  bomId?: string
  /** 商品的ID，副产品没有 */
  skuId?: string
  /** BOM的版本，只有成品和子BOM才有，原料和副产品没有 */
  revision?: string
  /** 商品名称 */
  name: string
  /** 商品数量，副产品没有 */
  amount?: string
  /** 商品单位，副产品没有 */
  unit?: string
  /** 商品成本，副产品没有 */
  cost?: string
  /** 成本单位，副产品没有 */
  cost_unit?: string
  /** 是否显示数量，副产品没有 */
  showAmount?: boolean
  /** 是否为BOM，用于展示跳转的文字 */
  isBom?: boolean
  /** BOM的查询字符串，用于跳转至新的BOM */
  bomQuery?: string
}

/**
 * BOM流程图中单道工序的属性
 */
interface SingleProcess {
  /** 工序名称 */
  name: string
  /** 出成率 */
  yieldRate?: string
}

/**
 * BOM流程图中多道工序的属性
 */
interface MultiProcess {
  /** 总出成率 */
  yieldRate?: string
  /** 子工序 */
  processes: SingleProcess[]
}

/**
 * BOM流程图汇总工序的属性
 */
interface Process {
  /** 工序名称 */
  name?: string
  /** 出成率 */
  yieldRate?: string
}

/**
 * BOM流程图中BOM的基本属性
 */
interface CommonBom {
  /** 成品 */
  products: Item[]
  /** 副产品 */
  byProducts?: Item[]
  /** 工序 */
  processes: Process[]
  /** 是否显示成本 */
  showCost: boolean
  /** 是否是单品BOM */
  isSingle?: boolean
}
/**
 * BOM流程图中单品BOM的属性
 */
interface SingleBom extends CommonBom {
  /** 原料 */
  materials: Item[]
}

/**
 * BOM流程图中组合BOM的属性
 */
interface ComboBom extends CommonBom {
  /** 原料 */
  materials: (SingleBom | ComboBom | Item)[]
}

/**
 * BOM流程图中包装BOM的属性
 */
interface PackBom extends CommonBom {
  /** 原料 */
  materials: Item[]
}

export type {
  CardConfig,
  ProcessConfig,
  Item,
  SingleProcess,
  MultiProcess,
  SingleBom,
  ComboBom,
  PackBom,
  Process,
  CommonBom,
}
