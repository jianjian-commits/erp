import { MoreSelectDataItem } from '@gm-pc/react'
import { SsuInfo } from 'gm_api/src/merchandise'
import {
  ListProcessTaskFilter,
  ProcessTask,
  ProcessTaskCommand,
  ProcessTaskDetail,
  ProcessTask_State,
  SplitTaskProcessRequest_SplitData,
} from 'gm_api/src/production'
import { SingleValueType } from 'rc-cascader/lib/Cascader'
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
  begin_time: Date
  end_time: Date
  target_customer_id?: MoreSelectDataItem<string>
  target_route_id?: MoreSelectDataItem<string>
  process_template_id?: MoreSelectDataItem<string>
  output_sku_id?: MoreSelectDataItem<string>
  input_sku_id?: MoreSelectDataItem<string>
  select_type?: number
  batch?: string
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
