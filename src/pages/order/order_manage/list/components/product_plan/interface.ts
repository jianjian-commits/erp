import { DataNode } from '@/common/interface'
import type { BatchProps } from '@/pages/order/interface'
import { Filters_Bool, SetFlag_Bool } from 'gm_api/src/common'
import { DispatchProductionTaskFromOrderRequest } from 'gm_api/src/orderlogic'

type Flag = 1 | 2

export interface SelectedNodeMap {
  [key: string]: string[]
}

export interface Plan {
  plan_id: number
  plan_type: string
  remark: string
  flag: Flag
  delivery_time: Date | null
}
export interface PlanProps extends BatchProps {
  count: number
  onCancel: () => void
  onOk: (
    v: Plan[],
    productionByCustomer?: number,
    packByCustomer?: number,
  ) => void
}

export interface SortGroupList {
  value: string[]
  delivery_time: moment.Moment | null
  remark: string
  treeData: DataNode[]
  id: string
}

export interface NotProcessedData {
  /** 采购计划交期设置 */
  purchase_type: number
  /** 采购设置分类交期 */
  isSetClassify: boolean
  sortGroupList: SortGroupList[]
  /** 采购计划波次  */
  purchase_batch: string
  /** 采购计划时间 */
  purchase_time: moment.Moment | undefined
}

export interface ProcessedData extends NotProcessedData {
  /** 生产计划模式设置 */
  production_merge_mode: number
  /** 生产单品BOM计划交期设置 */
  production_cleanfood_type: number
  /** 生产组合BOM计划交期设置 */
  production_type: number
  /** 生产计划单品BOM波次 */
  production_cleanfood_batch: string
  /** 生产计划组合BOM波次 */
  production_batch: string
  /** 生产组合BOM交期时间 */
  production_time: moment.Moment | undefined
  /** 生产单品BOM交期时间 */
  production_cleanfood_time: moment.Moment | undefined
  /** 包装计划交期设置 */
  pack_type: number
  /** 包装计划模式设置 */
  pack_merge_mode: number
  /** 包装计划波次 */
  pack_batch: string
  /** 包装计划时间 */
  pack_time: moment.Moment | undefined
  /** 是否采购 */
  need_purchase: SetFlag_Bool
  /** 单品生产计划id */
  production_cleanfood_order: string
  /** 组合生产计划id */
  productio_order: string
  /** 包装生产计划id */
  pack_order: string
  to_production_order: Filters_Bool
}

export interface ProductPlanProps {
  onClose?: () => void
  /** 是否选择全部 */
  isSelectAll: boolean
  /** 已选择ids */
  selected: string[]
  /** 区分按订单和按商品 */
  isOrder?: boolean
  /** 默认值 */
  defaultValue?: Record<string, any>
}

export interface ProductPlanParams {
  params: DispatchProductionTaskFromOrderRequest
  categories: {
    category_ids: string[]
  }[]
  saveSetting: () => Promise<any>
}
