import { MoreSelectDataItem as MoreSelectDataItem_v2 } from '@gm-pc/react'
import {
  SsuInfo,
  Sku_NotPackageSubSkuType,
  Sku_PackageCalculateType,
} from 'gm_api/src/merchandise'
import {
  ListProcessTaskFilter,
  ProcessTask,
  ProcessTaskCommand,
  ProcessTaskDetail,
  ProcessTaskRelation,
  ProcessTask_State,
  SplitTaskProcessRequest_SplitData,
  Task,
} from 'gm_api/src/production'
import { SingleValueType } from 'rc-cascader/lib/Cascader'
import type { GetUnitType } from '@/pages/production/interface'
export interface FilterType
  extends Omit<
    ListProcessTaskFilter,
    | 'begin_time'
    | 'end_time'
    | 'target_customer_id'
    | 'target_route_id'
    | 'process_template_id'
    | 'output_sku_id'
    | 'input_sku_id'
    | 'batch'
    | 'processor_ids'
  > {
  // 重命名,不与MoreSelectDataItem冲突
  target_customer_id?: MoreSelectDataItem_v2<string>
  target_route_id?: MoreSelectDataItem_v2<string>
  process_template_id?: MoreSelectDataItem_v2<string>
  output_sku_ids?: string[]
  input_sku_ids?: string[]
  select_type?: number
  batch?: { value: number; text: string }
  processor_ids?: SingleValueType[]
}

export interface ProcessTaskMoreDetail extends ProcessTask {
  routerName: string
  customerName: string
}
export interface MapProcessTaskDetail
  extends Omit<ProcessTaskDetail, 'process_task'> {
  process_task_id: string
  edit: boolean
  processor: string
  ssuInfo?: SsuInfo // 包装计划需要
  process_task: ProcessTaskMoreDetail
  splitPrepareList: ProcessTaskCommand[]
  packRate?: string // 包装下的换算关系
}

export interface SplitTaskType
  extends Omit<SplitTaskProcessRequest_SplitData, 'plan_amount' | 'processor'> {
  plan_amount: number
  _plan_amount: null | number //
  state: ProcessTask_State
  processor: string
}

export interface ChangeListTpe {
  index: number
  unitName?: string
  data?: MapProcessTaskDetail
  onChange: <T extends keyof MapProcessTaskDetail>(
    index: number,
    key: T,
    value: MapProcessTaskDetail[T],
  ) => void
}

// todo  兼容antd和gm-kcSelect
export type CascaderAndSelectOptions<T> = {
  text: string
  label: React.ReactNode
  value: T
  children?: CascaderAndSelectOptions<T>[]
  [key: string]: any
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
  sku_type?: Sku_NotPackageSubSkuType | Sku_PackageCalculateType
  base_unit_id?: string
  base_unit_name: string
  plan_amount?: string // 计划生产(包装/生产共用)
  actual_amount?: string // 已产出数
  output_amount?: string // 产出数
  isByProduct?: boolean // 是否为副产物
  // 包装计划用
  spec?: string // 规格
  unit_id?: string
  pack_base_unit_name?: string // 包装基本单位
  pack_unit_name?: string // 包装包装单位
  pack_base_actual_amount?: string // 已产出数（基本单位）
  pack_actual_amount?: string // 已产出数（包装单位）
  pack_base_output_amount?: string // 产出数（基本单位）
  pack_output_amount?: string // 产出数(包装单位)
}
export interface TaskSkuInfo {
  sku: TaskSku[] // 产出数据
  task_command_no: string // 指令编号是serial_no-sequence_no
  process_task_command_id: string // 指令id
  state: ProcessTask_State
}
export interface OutPutTasksType {
  process_task_command: ProcessTaskCommand
  processor: string
  ssuInfo?: SsuInfo // 包装计划需要
  process_task?: ProcessTask
  process_task_relations?: ProcessTaskRelation[]
  packRate?: string // 包装下的换算关系
}

export interface MoreSelectDataItem {
  label?: string
  value?: any
}
