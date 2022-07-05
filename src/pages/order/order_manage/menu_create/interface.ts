import { Quotation } from 'gm_api/src/merchandise/index'
import { Customer } from '@/pages/merchandise/manage/bom/interface'

interface MenuInfo extends Quotation {
  // attrs: any
  valid_start: string
  valid_end: string
}

interface SelectDataItem {
  text: string
  value: string
}

export interface MenuWithSelectDataItem extends SelectDataItem {
  original: MenuInfo
}
export interface CustomerWithSelectDataItem extends Customer, SelectDataItem {
  original: Customer
}

export interface Field {
  menu: MenuWithSelectDataItem | undefined
  customer: CustomerWithSelectDataItem | undefined
  customers: CustomerWithSelectDataItem[]
}

export interface SummaryData {
  name: string
  count: number
  price: number
}

export interface Summary {
  menu_time: string
  total_price: number
  data: SummaryData[]
}
