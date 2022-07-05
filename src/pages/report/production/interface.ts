import { Sku_NotPackageSubSkuType } from 'gm_api/src/merchandise'
import { Task, TaskInput, Task_TimeType } from 'gm_api/src/production'

export interface Filter {
  begin_time: Date
  end_time: Date
  q: string
  sku_type: Sku_NotPackageSubSkuType
  sort_type: 'desc' | 'asc' | '' // 先简单定义
  time_type: Task_TimeType
}

export interface MaterialInfo {
  sku_id?: string
  sku_name?: string
  unit_id?: string
  plan_usage_amount_sum?: string
  actual_usage_amount_sum?: string
  actual_usage_total_price_sum?: string
  sku_unit_rate?: string // 单物料时与成品单位的转换关系
  receive_amount_sum?: string
  return_amount_sum?: string
  reference_cost: string // 参考成本
}

export interface ByProductInfo {
  sku_id?: string
  sku_name?: string
  base_unit_id?: string
  base_unit_output_amount_sum?: string
}

export interface ReportTaskInfo {
  customized_code?: string
  category_path?: string
  sku_type?: string
  base_unit_id?: string
  unit_id?: string
  output_amount_sum?: string
  base_unit_name?: string
  base_unit_output_amount_sum?: string
  base_unit_new_stock_quantity?: string
  actual_usage_amount_sum?: string
  bom_id?: string
  bom_name?: string
  input_actual_usage_total_price_sum?: string
  sku_id?: string
  sku_name?: string
  task_id_count?: string
  task_ids?: string
  spec_name?: string
  spec?: string
  pack_unit_name?: string
  materials: MaterialInfo[]
  by_products: ByProductInfo[]
  input_sku_id?: string
  bom_revisions?: string
}

export interface ReportDetailInfo extends Task {
  base_unit_name?: string
  actual_money?: string
  actual_product_percentage?: string
  avg_price?: string
  task_inputs?: TaskInput[]
}
