import { FlowEdge, FlowNode } from '@gm-common/graph'
import { TaskProcess, TaskOrder, TaskSource } from 'gm_api/src/production'
import { SsuInfo } from 'gm_api/src/merchandise'

interface TaskProcessInfo extends TaskProcess {
  index: number
  isEditing?: boolean
  processor_select?: string[]
}

interface BomData {
  nodes: FlowNode[]
  edges: FlowEdge[]
}

interface SplitTaskInfo {
  amount: string
  processor: string
  processor_select?: string[]
}

interface FactoryModal {
  processor_id: string
  name: string
  parent_id: string
}

interface TaskOrderItem extends Partial<TaskOrder> {
  sku_name?: string
  spec?: string
}

interface TaskSourceItem extends Partial<TaskSource> {
  sku_name?: string
  spec?: string
  ssuInfo?: SsuInfo
  unit_name?: string
}

export type {
  TaskSourceItem,
  SplitTaskInfo,
  FactoryModal,
  TaskProcessInfo,
  BomData,
  TaskOrderItem,
}
