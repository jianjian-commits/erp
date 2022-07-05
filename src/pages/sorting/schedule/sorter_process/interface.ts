export interface Filter {
  service_period_id: string
  receive_date: Date
}

export interface TotalInfo {
  total_count: number // 总分拣任务数
  weight_count: number // 已称重任务数
  out_stock_count: number // 缺货任务数
  unweight_count: number // 未称重任务数
}

export interface WeightInfo {
  weight_task_count: number // 记重任务数
  unweight_task_count: number // 不记重任务数
  ssu_count: number // 商品种类数
  customer_count: number // 商户数
}

export interface OrderSortingInfo {
  total: number
  finished: number
  orders: OrderSortingInfo2[]
}

export interface OrderSortingInfo2 {
  order_id: string
  total: number
  finished: number
  customize_code?: string
  name?: string
}

export interface CategorySortingInfo {
  name: string
  total_count: number // 总分拣任务数
  weight_count: number // 已称重任务数
  out_stock_count: number // 缺货任务数
  unweight_count: number // 未称重任务数
}

export interface SsuSortingInfo {
  customize_code: string
  name: string
  total: number
  finished: number
}
