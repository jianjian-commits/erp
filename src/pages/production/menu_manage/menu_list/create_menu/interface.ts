import { ReqCreateMenu } from 'gm_api/src/merchandise'
// Menu_CycleType
// 'replace_time'
export interface MenuData extends Omit<ReqCreateMenu, 'customer_ids'> {
  // start_day: string // 如果是周，使用 1～7 代表周一到周日
  // start_time: Date
  // cycle_type: Menu_CycleType
  // customer_ids: any
  menu_period_group_id: string[]
  meal_label: any
  // menu_periods: Menu_MenuPeriodInfo_MenuPeriod[]
}

export interface PeriodGroupData {
  name: string
  id: string
}
