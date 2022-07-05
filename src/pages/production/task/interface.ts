import type { UnitGlobal } from '@/stores/global'
import { MoreSelectDataItem } from '@gm-pc/react'
import {
  GetManySkuResponse_SkuInfo,
  Sku_NotPackageSubSkuType,
  Sku_PackageSubSkuType,
  SsuInfo,
} from 'gm_api/src/merchandise'
import {
  ListTaskRequest,
  ProcessTask,
  ProcessTaskCommand,
  ProcessTaskRelation,
  Task,
  Task_State,
} from 'gm_api/src/production'
import { PurchaseTask } from 'gm_api/src/purchase'
import type { GetUnitType } from '../interface'

export interface Filter
  extends Omit<ListTaskRequest, 'begin_time' | 'end_time' | 'paging'> {
  // time_type: number
  begin_time: Date
  end_time: Date
  // state?: number // 计划状态
  // source?: number // 计划来源
  // batch_info?: string // 计划波次
  // sku_type?: number // 商品类型
  // processor_ids?: string[] // 工厂模型
  // target_customer_ids?: string[] // 生产对象
  // search_text?: string // 输入搜索
  // processor_selected: string[]
  user_selected: MoreSelectDataItem<string>[]
  processor_selected: string[][]
  batch: string
  route: MoreSelectDataItem<string>[]
  selected?: number
}

export interface TaskInfo extends Task {
  isEditing?: boolean
  _plan_amount?: string // 保留一份计划数数据
  sku_type?: Sku_NotPackageSubSkuType
  unit_name?: string
  stock_amount?: string
  router_name?: string
  customer_name?: string
  unit_info?: GetUnitType
}

export interface TaskSku {
  sku_id?: string
  sku_name?: string
  unit_id?: string
  unit_name?: string // 生产 sku 基本单位
  output_amount?: string // 生产 产出数
  sku_type?: Sku_NotPackageSubSkuType | Sku_PackageSubSkuType | undefined
  plan_amount?: string // 计划生产数
  isByProduct: boolean
  finish_amount?: string // 已完成数

  // 包装计划用
  spec?: string // 规格
  pack_base_finish_amount?: string // 已产出数（基本单位）-- 通过规格去换算
  pack_finish_amount?: string // 已产出数（包装单位）
  pack_base_output_amount?: string // 产出数（基本单位）
  pack_output_amount?: string // 产出数(包装单位)
  pack_base_unit_name?: string // 基本单位
  pack_unit_name?: string // 包装单位
}

export interface TaskSkuInfo {
  skus: TaskSku[]
  task_id: string
  serial_no: string
  state: Task_State // 计划状态
  original: Task // 源数据
}

export interface PurchaseTaskExpand extends PurchaseTask {
  skuInfo: GetManySkuResponse_SkuInfo
  task_ids: string[]
}

export interface ProcessTaskDetailExpand extends ProcessTask {
  process_task_commands?: ProcessTaskCommand[]
  process_task_relations?: ProcessTaskRelation[]
  ssuInfo?: SsuInfo
  isPack: boolean
  task_ids: string[]
  unitList: UnitGlobal[]
}
