import {
  Task_Type,
  TaskInput_MaterialType,
  ListTaskInputRequest_ViewType,
  ListTaskInputRequest_PagingField,
  MaterialOrder_State,
} from 'gm_api/src/production'
import React from 'react'

export interface RequireFilterType {
  /** 生产 TYPE_PRODUCE_CLEANFOOD，包装 TYPE_PACK */
  task_types: Task_Type[]
  /** 原料视图 VIEW_TYPE_CATEGORY，领料单视图 VIEW_TYPE_MATERIAL_ORDER */
  view_type: ListTaskInputRequest_ViewType
  material_types: [TaskInput_MaterialType.MATERIAL_TYPE_MATERIAL]
  /** 是否需要sku数据 */
  need_sku: boolean
  /** 是否返回工厂、小组 */
  need_processor: boolean
  /** 是否返回领料单 */
  need_material_order: boolean
  /** 计划ID */
  production_order_id: string
}

export interface FilterType extends RequireFilterType {
  sku_ids?: string[] // 商品
  processor_ids?: string[] // 车间、小组
  category_ids?: React.Key[] // 分类
  material_order_serial_no?: string // 领料单编号
  stock_sheet_serial_no?: string // 领料出库单编号
  /** 分类 */
  sort_by?: { field: ListTaskInputRequest_PagingField; desc: boolean }
  batch?: string // 备注
}

export interface OriginalItemType {
  /* 物料名称 */
  name: string
  /** 物料类型 */
  skuType: string
  /** 物料分类 */
  category: string
  /** 基本单位名称 */
  baseUnit: string
  /** 需求数 */
  planUsageAmount: string
  /** 领料出库数量 */
  receiveAmount: string
  /** task_input_id */
  taskInputId: string
  /** 领料车间名称 */
  processorWorkShop: string
  /** 领料小组名称 */
  processorGroup: string
  /** 领料单编号 */
  serialNo: string
  /** 领料出库单编号 */
  stockSheetSerialNo: string
  sheetId: string
  /** material_order_id */
  materialOrderId: string
  key: string
  /** 备注 */
  batch: string
}

export interface OriginalListType {
  key: string
  /* 物料名称 */
  name: string
  children: OriginalItemType[]
}

export interface PickingItemType extends OriginalItemType {
  state: MaterialOrder_State
}

export interface PickingListType {
  key: string
  serialNo: string
  materialOrderId: string
  children: PickingItemType[]
}

export interface MaterialOrderItemType {
  name: string
  skuType: string
  category: string
  baseUnit: string
  planUsageAmount: string
  receiveAmount: string
}

export interface MaterialOrderType {
  state: MaterialOrder_State
  serialNo: string
  stockSheetSerialNo: string
  sheet_id: string
  children: MaterialOrderItemType[]
  title?: string
}

export interface MoreSelectDataItem {
  label: string
  value: any
}
