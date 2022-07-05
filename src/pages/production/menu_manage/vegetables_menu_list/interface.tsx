import { TreeListItem } from '@gm-pc/react'
import {
  ReqCreateQuotation,
  Quotation_CycleType,
  ListQuotationRequest,
  Quotation,
} from 'gm_api/src/merchandise'

export interface FilterProps extends Omit<ListQuotationRequest, 'paging'> {
  select_status: number
}

export interface MenuQuotation extends Quotation {
  is_active: boolean
  start_time_front: Date
  customer_ids: string[]
  start_day: string
  cycle_type: number
  menu_period_group_ids: string[]
}

export interface QuotationData
  extends Omit<ReqCreateQuotation, 'update_valid_time'> {
  quotation_id: string
  start_day: string // 如果是周，使用 1～7 代表周一到周日
  start_time: Date
  cycle_type: Quotation_CycleType
  customer_ids: any
  menu_period_group_ids: string[]
}

export interface Enum {
  value: number | string
  text: string
  [key: string]: any
}

export interface SelectStatusType<T> {
  TO_ID: T
  TO_NAME: T
}
