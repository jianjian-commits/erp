import { Order, OrderDetail } from 'gm_api/src/order'
import { Customer, GroupUser } from 'gm_api/src/enterprise'
import { MoreSelectDataItem } from '@gm-pc/react'

export interface OrderFilter {
  begin_time: Date
  end_time: Date
  time_type: number

  search: string
  status: number // 订单状态
  sort_status: number // 分拣状态
  print_status: string // 打印状态

  driver_selected: MoreSelectDataItem<string>[] // 司机筛选
  route_selected: MoreSelectDataItem<string>[] // 线路筛选
  quotation_ids: string[]
}

export interface OrderList_OrderDetail extends OrderDetail {
  editing: boolean
  _sku_id: string
  // 出库数
  realQuantity: number
  baseRealQuantity: number
  // 下单数
  quantity: number
  baseQuantity: number

  categoryName: string
  quotationName: string

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
export interface SortingList extends Omit<Order, 'order_details'> {
  customer: Customer
  driver: GroupUser
  _process: string // 分拣进度
  _route: string // 线路
  order_details: OrderList_OrderDetail[]
}

export interface ListMeta {
  total: number
  finish: number
  unFinish: number
}

export interface SortingInfo extends Order {
  customer: Customer
}

export interface InitData {
  finished: number
  total: number
  orders: Array<any>
}

export interface FilterParam {
  time_config_id: string
  start_date: string
  end_date: string
  need_details: number
  route_id?: string
  status?: number
  inspect_status?: string
  sort_status?: string
  search?: string
  carrier_id?: string | null
  driver_id?: string | null
  print_status?: string
}

export interface CarrierDriverList {
  name: string
  value: string
  children?: Array<CarrierDriverList>
}

export interface Route {
  id: number
  create_time: string
  address_count: number
  create_user: string
  name: string
}

export type RouteList = Array<Route>
