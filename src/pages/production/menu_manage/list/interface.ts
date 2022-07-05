import { ServicePeriod } from 'gm_api/src/enterprise'
import { MenuPeriod } from 'gm_api/src/merchandise'

// eslint-disable-next-line @typescript-eslint/class-name-casing
export interface Menu_Period extends MenuPeriod, ServicePeriod {
  isEditing: boolean
  icon: IconsData
}

export interface CreateOrBatchData {
  // 创建餐次
  name: string
  icon: IconsData
  order_create_min_time: Date
  order_create_max_time: Date
  order_receive_min_time: string
  order_receive_max_time: string
  order_receive_min_date: string
  order_receive_max_date: string
  default_receive_time: Date
  default_receive_date: string
}

export interface IconsData {
  id: string
  url: string
  show: boolean
}
