import { ListDataItem, MoreSelectDataItem } from '@gm-pc/react'
import { AppointTimeSettings_Type } from 'gm_api/src/preference'
import { Bom, CreatePlanTaskRequest, Task_Type } from 'gm_api/src/production'

export interface ProductPlanType {
  type?: Task_Type
}

export interface ProductDetailInfo {
  sku_id: string
  unit_id: string // sku 单位
  order_amount: string // 计划生产数
  sku_name: string // 商品名
  category_name: string // 分类
  suggest_amount: string // 建议计划生产数
  stock_amount: string // 库存数
  unit_name: string
  unit_ids: ListDataItem<string>[]
  customized_code: string
  revision?: string
  bomInfo?: Bom
}

export interface CreateTaskInfo
  extends Omit<
    CreatePlanTaskRequest,
    'product_details' | 'target_customer_id'
  > {
  delivery_time: Partial<{ [key in AppointTimeSettings_Type]: string }>
  batch?: Partial<{ [key in AppointTimeSettings_Type]: string }>
  target_customer_id?: string
  target_customer: MoreSelectDataItem<string> | undefined
  target_router?: MoreSelectDataItem<string>
  product_details?: ProductDetailInfo[]
  productionOrderId: string
}

export interface AppointTimeSettingType {
  value: AppointTimeSettings_Type
  text: string
}

export interface Query {
  productionOrderId: string
  name: string
  filter: any
}
