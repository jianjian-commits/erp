import { Moment } from 'moment'
import {
  Budget,
  SemesterType,
  SchoolType,
  Customer,
} from 'gm_api/src/enterprise'
export interface FilterOptions {
  year: Moment | null
  school_type: SchoolType
  semester_type: SemesterType
  menu_period_group_id: string
  q: string
}

export interface KVProps {
  dining_count: string
  menu_period_group_id: string
  order_id_count: string
  sale_price_sum: string
  receive_time: string
  receive_customer_id: string
}
export interface ListOptions extends Omit<Budget, 'group_id'>, Customer {
  budget_id: string
  semester_type: SemesterType
  mealTimes: string
  mealTimesCount: number
  order_id_count: number // 每人已使用餐数
  dinning_count: number // 已使用总餐数
  order_price_sum: number // 已使用金额
  isExpired: boolean
  used_amount_list: KVProps[]
}
