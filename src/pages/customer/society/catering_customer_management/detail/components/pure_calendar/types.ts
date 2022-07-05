import { CSSProperties } from 'react'
import {
  AnalyticsCustomerMealRecordResponse_Analytic,
  CustomerMealRecord,
} from 'gm_api/src/enterprise'
import { Moment } from 'moment'

interface DataItem {
  time: number
  cost: string
  month: number
}
interface RangeCalendarProps {
  data: AnalyticsCustomerMealRecordResponse_Analytic[]
  customerMealRecordListMap: { [key: string]: CustomerMealRecord }
  fetchData: (date: Moment) => void
  className?: string
  style?: CSSProperties
}

export type { RangeCalendarProps, DataItem }
