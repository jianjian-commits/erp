import { PagingParams } from 'gm_api/src/common'
import type { GroupUser, Supplier } from 'gm_api/src/enterprise'
import type { PurchaseSheet as PS, PurchaseTask } from 'gm_api/src/purchase'
import type { Sku, Sku_SkuLevel } from 'gm_api/src/merchandise'
import { PaginationProps } from '@gm-pc/react'

export interface LevelData extends Sku_SkuLevel {
  text: string
  value: string
  disable: boolean
  label: string
}
export interface Task extends PurchaseTask {
  isEditing?: boolean
  sku: Sku
  stock?: string
  stockUnitName?: string
  supplier: any
  purchaser: any
  batch: any
  base_stock: any // 库存(基本单位)
  category_name: string // 分类
  rate: string
  unit_name: string
  sku_level_name: string
  levelData: LevelData[]
  upperLimiit?: string
}
export interface ListRequestParams {
  [key: string]: any
  paging_params: PagingParams
}

export interface FilterProps {
  onSearch: (params?: any) => Promise<any>
  pagination: PaginationProps
}

export interface Query {
  id: string
}

export interface PurchaseSheet extends PS {
  creator?: GroupUser
  purchaser?: GroupUser
  supplier?: Supplier
}
