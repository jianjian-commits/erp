import { TreeListItem } from '@gm-pc/react'
import { Shelf } from 'gm_api/src/inventory'
import { Category, Spu, Unit } from 'gm_api/src/merchandise'

export interface ComShelf extends Shelf, TreeListItem {}
export interface ComCategory extends Category, Spu, TreeListItem {}

export interface SkuForShelf {
  sku_id: string
  sku_customized_code: string

  imageUrl: string

  sku_name: string // sku名称
  ssu_name: string // 规格名称
  sku_base_unit_name: string // 基本单位name

  sku_stock_base_quantity: string // 批次商品数量
  sku_stock_base_price: string // 批次商品价值
}

export interface SkuForShow {
  sku_id: string
  sku_customized_code: string
  batch_count: number // 批次数量
  stock_num: number // 商品库存数量
  stock_money: number // 商品库存货值
  imageUrl: string
  sku_base_unit_name: string // 基本单位name

  sku_name: string // sku名称
  ssu_name: string // 规格名称
  units?: Unit
  sku_base_unit_id: string
  second_base_unit_ratio?: string
  second_base_unit_id?: string
  second_base_unit_quantity?: string | number
  second_base_unit_name?: string
}
