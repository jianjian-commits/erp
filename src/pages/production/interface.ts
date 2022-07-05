import { ListTaskRequest, Task_Type } from 'gm_api/src/production'
import { Unit } from 'gm_api/src/merchandise'
import * as merchandise from 'gm_api/src/merchandise'
import { PagingParams } from 'gm_api/src/common'

export interface CategoryFilter {
  category1_ids: []
  category2_ids: []
}

export interface ObjectOfKey<T> {
  [key: number]: T
  [key: string]: T
}

export interface Options {
  value: string
  text: string
  children?: Options[]
}

export interface PagingRequest {
  offset?: number
  limit: number
  need_count?: boolean
}

export interface TableRequestParams {
  [propName: string]: any
  paging: PagingRequest
}

export interface UnitInfoParams {
  unit_id: string
  units: { [key: string]: Unit }
  sku_id?: string
  skus?: { [key: string]: merchandise.GetManySkuResponse_SkuInfo }
}

export interface PrintInfo {
  value: number
  text: string
  parent_value?: number
  info?: string
  default_children_value?: number
  isTeam?: boolean
  children?: PrintInfo[]
}

export interface ListTaskBillQuery {
  filter?: ListTaskRequest
  task_ids?: string[]
  level?: 1 | 2 // 1为车间，2为小组
  paging: PagingParams
  taskType?: Task_Type
}

export interface GetUnitType {
  unitId: string
  unitName: string
  baseUnitId: string
  baseUnitName: string
  rate: string
  ssuName: string
}

export interface TypeText {
  isOrder: string
  isPack: string
  isPlanPack: string
  isProduct: string
  isPlanProduct: string
}
