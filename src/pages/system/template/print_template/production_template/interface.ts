import { PRINT_COMMAND_VAlUE } from '@/pages/production/task_command/enum'
import {
  ListTaskProductSheetByProcessorResponse_Sheet,
  ListTaskProductSheetByProcessorResponse,
  ProcessTask_Material,
  ProcessTaskCommand,
  ProcessTaskDetail,
  ProcessTask_Input,
  ProcessTask_Inputs,
  Bom,
  Task,
} from 'gm_api/src/production'
import {
  clear_food_field,
  cooked_food_fields,
  pack_fields,
} from './config/add_fields'
import {
  finish_product_config,
  material_config,
  pack_config,
  process_config,
} from './config/template_config'

import { SsuInfo, Unit, Sku } from 'gm_api/src/merchandise'

export type ProcessTaskCommands =
  | Partial<ProcessTaskCommandExpand>[]
  | Partial<ProcessTaskCommandExpand>

export interface ListTaskProductSheetByProcessorResponseSheet
  extends Omit<
    ListTaskProductSheetByProcessorResponse_Sheet,
    'process_task_commands'
  > {
  process_task_commands?: ProcessTaskCommands[]
  processorName?: string
}

export interface ListTaskProductSheetByProcessorResponseExpand
  extends Omit<ListTaskProductSheetByProcessorResponse, 'sheets'> {
  sheets?: ListTaskProductSheetByProcessorResponseSheet[]
}

export interface ClearFoodQuery {
  /** 模板id */
  printId: string
  /** ListTaskProductSheetByProcessor的请求参数 */
  filter: string
  level: PRINT_COMMAND_VAlUE
  /** 聚合方式 工序(process) 物料(material) */
  mergeType: MergeType
}

export enum MergeType {
  TYPE_MATERIAL = 1, // 物料
  TYPE_FINISH_PRODUCT = 2, // 生产产品
  TYPE_PROCESS = 3, // 工序
  TYPE_PACK = 4, // 包装
}

export const groupByType: Record<string, string> = {
  [MergeType.TYPE_MATERIAL]: 'input_sku_id',
  [MergeType.TYPE_FINISH_PRODUCT]: 'finishProductSkuId',
  [MergeType.TYPE_PROCESS]: 'process_template_id',
  [MergeType.TYPE_PACK]: 'process_task_command_id',
}

export const addFieldsType: Record<string, object> = {
  [MergeType.TYPE_MATERIAL]: clear_food_field,
  [MergeType.TYPE_FINISH_PRODUCT]: cooked_food_fields,
  [MergeType.TYPE_PACK]: pack_fields,
}

export const templateConfigType: Record<string, object> = {
  [MergeType.TYPE_MATERIAL]: material_config,
  [MergeType.TYPE_FINISH_PRODUCT]: finish_product_config,
  [MergeType.TYPE_PACK]: pack_config,
  [MergeType.TYPE_PROCESS]: process_config,
}
export type TemplateConfig = {
  contents: Contents[]
  footer: object
  header: object
  name: string
  page: object
  productionMergeType?: MergeType
  sign: object
  tableRowSpanTdArr?: object[]
  templateType?: string
}
export interface Contents {
  className?: string
  columns?: Columns[]
  dataKey?: string
  specialConfig?: object
  subtotal?: object
  type: string
}
export interface Columns {
  head: string
  headStyle: object
  noRemove: string
  rowSpan?: string
  style: object
  text: string
}

export interface MaterialName extends Omit<ProcessTask_Material, 'sku_id'> {
  sku_name: string
  production_unit?: Unit
}

/**
 * 物料的一些信息
 */
type MaterialRelevant = {
  materialName?: string // 物料名称
  production_unit?: Unit // 生产单位信息
  materialSku?: Sku // 物料信息
}

/**
 * 预处理 实际物料信息最后会放在最外层
 */
export type TaskInputExpand = ProcessTask_Input & MaterialRelevant

interface TaskInputsExpand extends Omit<ProcessTask_Inputs, 'inputs'> {
  inputs: TaskInputExpand[]
}

export type SignProcessTaskType = {
  isSign?: boolean
  target_customer_ids?: string[]
  target_route_ids?: string[]
  taskIdS?: string[]
}

export type ProcessTaskCommandMerge = ProcessTaskCommand & SignProcessTaskType
export interface ProcessTaskCommandExpand
  extends MaterialRelevant,
    Omit<ProcessTaskCommandMerge, 'inputs'> {
  inputs: TaskInputsExpand
  // 按生产成品聚合
  finishProductSkuId?: string // 生产成品id
  // 排序相关
  ssuName?: string // 包装的规格名称
  finishProductName?: string // 成品名称
  // 其他信息
  relevanceRoutes?: string[] // 关联线路
  relevanceCustomers?: string[] // 关联客户
  processTaskInfo: ProcessTaskDetail // 指导参数相关
  ssuInfo?: SsuInfo // 包装的规格信息
  finishProductSku?: Sku // 成品信息
  attrInfoArray?: string[] // 指导配料
  isCommand?: boolean // 组合工序
  bomInfo?: Bom // 净菜的bom
  taskInfo?: Task[]
  processYield?: string // 工序出成率
  isNoCommandOrLastProcess?: boolean // 是否展示成品
}
