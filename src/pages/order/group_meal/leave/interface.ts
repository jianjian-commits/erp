// import { Customer } from 'gm_api/src/enterprise'
import {
  ListLeaveOrderRequest,
  MenuPeriodGroups,
  LeaveOrderDetail,
  MenuPeriodIds,
  MenuPeriodGroup,
} from 'gm_api/src/eshop'
import { Moment } from 'moment'

export interface SelectedOptions {
  school_ids: string[]
  class_ids: string[]
}
interface Filter
  extends Omit<
    ListLeaveOrderRequest,
    'leave_date_start' | 'leave_date_end' | 'paging'
  > {
  leave_date_start?: string | null
  leave_date_end?: string | null
}

interface ObjectOfKey<T> {
  [key: number]: T
  [key: string]: T
}

interface MenuPeriod {
  [key: string]: MenuPeriodGroup
}

interface MenuPeriodNameProps {
  details: Record<string, LeaveOrderDetail[]>[]
  menu_period_desc: MenuPeriodGroups
}

interface MenuPeriodsMap {
  [key: string]: MenuPeriodIds
}

type ItemProps = Record<string, { menu_period_group_ids: string[] }>

export type {
  Filter,
  ObjectOfKey,
  MenuPeriod,
  ItemProps,
  MenuPeriodNameProps,
  MenuPeriodsMap,
}
