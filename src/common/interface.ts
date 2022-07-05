import { Key, ReactNode } from 'react'
import {
  GetOrderMerchandiseSaleDataRequest_Type,
  TimeRange,
} from 'gm_api/src/databi'
import { Category } from 'gm_api/src/merchandise'
import { SelectedOptions } from '../common/components/category_filter_hoc/types'

interface SortItem<T = string> {
  sort_by: T
  sort_direction: SortDirection
}

type SortDirection = 'asc' | 'desc' | null

interface PrecisionMapType {
  salesInvoicing: number
  dpInventoryAmount: number // 进销存的金额、单价、货值部分
  order: number
  dpSupplierSettle: number
  common: number
}

type PrecisionMapKeyType = keyof PrecisionMapType

interface SSuExtends {
  ssu_base_unit_id?: string
  ssu_base_unit_name?: string
  ssu_unit_parent_id?: string
  ssu_unit_parent_name?: string
  ssu_unit_name?: string
  ssu_unit_rate?: number
  ssu_base_unit_rate?: number
  ssu_sale_rate?: number
}

interface HintType {
  text: string
  className?: string
}

export type {
  SortItem,
  SortDirection,
  PrecisionMapType,
  PrecisionMapKeyType,
  SSuExtends,
  HintType,
}

interface TimeRangeInput {
  dateType: number
  begin: Date
  end: Date
}
export interface Normalizes {
  time_range({ dateType, begin, end }: TimeRangeInput): TimeRange
  category(selected: string[]): {
    category_ids: string[]
    category_type: GetOrderMerchandiseSaleDataRequest_Type
  }
}

/**
 * @description 树节点 for ant-design 树形组件
 */
export interface DataNode {
  title: ReactNode
  value: Key
  key: Key
  parentId: Key
  origins: Category
  children?: DataNode[]
  /** 是否可选中 */
  selectable?: boolean
  /** 当树为 checkable 时，设置独立节点是否展示 Checkbox */
  checkable?: boolean
  /** 禁用响应 */
  disabled?: boolean
  /** 禁掉 checkbox */
  disableCheckbox?: boolean
  /** 叶子节点 */
  isLeaf?: boolean
  /** 目前支持三级分类 */
  level?: (1 | 2 | 3) & number
  /** 分类图标，目前只有一级分类存在分类图标 */
  icon?: string
  [key: string]: any
}

export interface DataOption {
  label: ReactNode
  value: Key
  children?: DataOption[]
  disabled?: boolean
}

/**
 * @description 树节点的map，用于寻址
 */
export interface DataNodeMap {
  [key: string]: DataNode
}
