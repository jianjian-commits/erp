import { Plan_Process } from '@/pages/production/plan_management/plan/enum'
import { Sku_NotPackageSubSkuType } from 'gm_api/src/merchandise'
import {
  ListProductionOrderRequest,
  ProductionOrder,
  Task,
  TaskSource,
} from 'gm_api/src/production'
export interface ProducePlanConditionType {
  /** 用于全局计划id  后续根据proto名全局修改 */
  productionOrderId: string
  /** 表头为生产还是包装通过这个来管理 */
  isProduce: boolean
  /** 展示服务于计划下拉框 */
  productionOrder?: ProductionOrderExpand
  /** 记录在哪个tabs */
  tab?: Plan_Process
}

export interface ListProductionOrderFilter
  extends Omit<
    ListProductionOrderRequest,
    'begin_time' | 'end_time' | 'paging'
  > {
  begin_time: Date
  end_time: Date
}

export interface PlanModalProps {
  visible: boolean
  onChangeVisible: () => void
  selectId?: string[]
}

export interface TaskInfo extends Task {
  title?: string
  isEditing?: boolean
  /** 服务于编辑 保存原计划数据 */
  _plan_amount?: string
  /** 三种子母表视角 */
  customerName?: string
  routerName?: string
  skuName?: string
  unit_name?: string
  sku_type?: Sku_NotPackageSubSkuType
  /** 来源 */
  taskSources: TaskSource[]
  /** 下达时间 */
  releaseTime?: string
  /** 物料类型 */
  materialType?: string
}

export interface ProductionOrderExpand extends ProductionOrder {
  lineName?: string
}
