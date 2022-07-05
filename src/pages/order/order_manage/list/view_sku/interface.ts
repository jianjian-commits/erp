import { FilterOptions } from '@/pages/order/interface'
import { Filters_Bool } from 'gm_api/src/common'
import { Sku_SupplierCooperateModelType } from 'gm_api/src/merchandise'
import { SortingStatus } from 'gm_api/src/order'

export interface F extends FilterOptions {
  category: string[]
  is_weight: string
  sort_status: SortingStatus
  is_create_purchase_task: number
  is_create_production_task: number
  sku_is_process: number
  sku_q: string
  accept_state: number
  manual_purchase: number
  supplier_cooperate_model_type: Sku_SupplierCooperateModelType | -1
  sku_unit_is_current_price: Filters_Bool
}
