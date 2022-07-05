import { Order_State, Order } from 'gm_api/src/order'
import { MenuPeriodGroup } from 'gm_api/src/eshop'

export interface FilterComProps {
  onSearch: () => Promise<any>
}

export interface ComponentProps {
  customer_type: number
}

export interface FilterProps {
  begin: Date
  end: Date
  search_text: string
  search_type: number
  school_ids: string[]
  class_ids: string[]
  menu_period_group_id: string
  state: Order_State
  order_nos?: string[]
}

export interface MenuPeriodGroup_ extends MenuPeriodGroup {
  value: string
  text: string
}

export interface OrderDetailProps extends Order {
  order_time_text?: string
  receive_time_text?: string
  update_time_text?: string
  update_id_text?: string
  menu_period_group_id_text?: string
  student_name_text?: string
  staff_name_text?: string
  parents_name_text?: string
  phone_text?: string
  parents_phone_text?: string
  school_text?: string
  class_text?: string
  state_text?: string
  creator_id_text?: string
}
