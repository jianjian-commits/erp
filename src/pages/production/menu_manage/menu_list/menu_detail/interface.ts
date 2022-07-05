import { MenuPeriodGroup, MenuDetail } from 'gm_api/src/eshop'
import { ServicePeriod } from 'gm_api/src/enterprise'

export interface SummaryProps {
  count: number
  total_price: string | number
}

export interface editStatusProps {
  [key: string]: boolean
}

export interface MealDetailProps {
  mealIndex: number
  editStatus: editStatusProps
}

export interface keyboardTableCellOptions {
  mealIndex: number
  ssuIndex: number
  editStatus: editStatusProps
}

export interface keyboardTableChildCellOptions {
  mealIndex: number
  ssuIndex: number
  bomIndex: number
  editStatus: editStatusProps
}

export interface menuPeriodOptions
  extends MenuPeriodGroup,
    Omit<ServicePeriod, 'menu_period_group_id'> {
  // menu_period_group_id: string
}

export interface effectCycleProps {
  begin: string | Date
  end: string | Date
}

export interface MenuDetailProps extends MenuDetail {
  menu_status: string
}
