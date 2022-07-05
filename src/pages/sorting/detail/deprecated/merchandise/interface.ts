import type { SelectedOptions } from '@/common/components/category_filter_hoc/types'
import * as merchandise from 'gm_api/src/merchandise'
import { OrderDetail, Order_State } from 'gm_api/src/order'

export interface Filter {
  begin_time: Date
  end_time: Date
  time_type: number
  search: string
  category: SelectedOptions
  quotation_ids: string[]
}

export interface List_OrderDetail extends OrderDetail {
  editing: boolean

  state: Order_State // 订单状态
  sorting_num: string // 分拣序号
  serial_no: string
  customerName: string

  // 出库数
  realQuantity: number
  baseRealQuantity: number
  // 下单数
  quantity: number
  baseQuantity: number

  // parseSsu return type
  ssu_base_unit_id?: string
  ssu_base_unit_name?: string
  ssu_unit_parent_id?: string
  ssu_unit_parent_name?: string
  ssu_unit_name?: string
  ssu_unit_rate?: number
  ssu_base_unit_rate?: number
  ssu_sale_rate?: string
}

export interface List extends merchandise.Ssu {
  quotationName: string
  categoryName: string
  _process: string // 分拣进度
  sub_list: List_OrderDetail[]
}

export interface ListMeta {
  total: number
  finish: number
  unFinish: number
}
