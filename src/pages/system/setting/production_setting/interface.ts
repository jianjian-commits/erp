export interface ProcessData {
  production_setting: number
  pack_setting: number
  is_algorithm_open: number
  avg_order_amount_setting: number
  avg_order_days: number
  adjust_ratio: number
  stock_up_type: number
  stock_up_days: number
  is_deduct_stock: boolean
  is_default_output_open: boolean
  is_default_material_replace_open: boolean // 默认打开物料代替
  material_regular: number
}
