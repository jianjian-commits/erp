interface AlgorithmFilter {
  production_object: string
  query_order_type: number // 日均下单数设置
  query_order_days: number // 手动填写的最近下单数，query_order_type === 1时使用
  adjust_ratio: number // 调整比例
  stock_up_type: number // 备货天数类型，1为按手动填写，2为按保质期
  stock_up_days: number // 手动填写的备货天数，stock_up_type === 1 时使用
  is_deduct_stock: number | boolean // 是否扣减库存
  product_show_type: number // 商品展示设置
}

interface RecommendSku {
  form_id: string
  form_name: string // 规格名称
  category_name_1?: string
  category_name_2?: string
  sku_name: string // 分类
  form: string // 规格
  form_unit: string // 规格单位
  finished_goods_inventory: number // 成品库存数
  suggest_plan_product_inventory_box: number // 建议生产数（包装单位）
  suggest_plan_product_inventory_base: number // 建议生产数(基本单位)
}

interface RecommendSkuFilter {
  plan_finish_time: Date | null
  plan_wave: number | string
  product_object: string
}

export type { AlgorithmFilter, RecommendSku, RecommendSkuFilter }
