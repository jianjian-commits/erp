import type { SelectedOptions } from '@/common/components/category_filter_hoc/types'
import { MoreSelectDataItem } from '@gm-pc/react'
import { Filters_Bool } from 'gm_api/src/common'
import { Customer, GroupUser } from 'gm_api/src/enterprise'
import { Order, OrderDetail } from 'gm_api/src/order'
import { SearchType } from '../components/searh_filter'

/**
 * 筛选条件的接口
 */
export interface Filter {
  begin_time: Date
  end_time: Date
  time_type: number

  search_type: SearchType

  serial_no: string // 订单号
  ssu_info: string // 商品信息，适用于商品编码或名称
  customer_info: string // 商户信息，适用于商户编码或名称

  status: number // 订单状态
  sort_status: number // 分拣状态
  print_status: Filters_Bool // 打印状态

  driver_selected: MoreSelectDataItem<string>[] // 司机筛选
  route_selected: MoreSelectDataItem<string>[] // 线路筛选
  quotation_ids: MoreSelectDataItem<string>[] // 报价单
  category: string[] // 分类

  receive_customer_id: string // 商户
}

/**
 * 订单列表的接口
 * OrderDetail的state不是订单状态
 */
export interface List extends Omit<OrderDetail, 'state'>, Partial<Order> {
  customer: Customer
  driver: GroupUser

  _route: string // 线路
  _order_print_status: number // 0/1 订单打印状态

  editing: boolean
  // 出库数
  weightQuantity: number
  weightQuantityUnit: string
  // 下单数
  orderQuantity: number
  orderQuantityUnit: string

  categoryName: string
  quotationName: string

  sku: any

  // parseSsu 返回的属性
  ssu_base_unit_id?: string
  ssu_base_unit_name?: string
  ssu_unit_parent_id?: string
  ssu_unit_parent_name?: string
  ssu_unit_name?: string
  ssu_unit_rate?: number
  ssu_base_unit_rate?: number
  ssu_sale_rate?: string
}
