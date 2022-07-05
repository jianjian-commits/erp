import { Customer } from 'gm_api/src/enterprise'
import {
  Cycle,
  OperationInfo_DeliveryInfo_Delivery,
  ReqCreateOperationInfo,
} from 'gm_api/src/eshop'
import { Moment } from 'moment'
interface DataNode extends Omit<Partial<Customer>, 'title' | 'key' | 'level'> {
  title: string
  key: string
  level: string
  children?: DataNode[]
}
interface CycleTimeItem {
  start: string
  end: string
  start_time: string | null | Date
  end_time: string | null | Date
}
interface CycleTime {
  [key: number]: CycleTimeItem
}
interface ServiceInfo {
  school_id: string
  semester_start: Date
  operation_info_id: string
  semester_end: Date
  delivery_infos: OperationInfo_DeliveryInfo_Delivery[]
  cycle: Cycle
  // start: string
  // end: string
  // start_time: string | null | Date
  // end_time: string | null | Date
  CycleTime: CycleTime
}

interface FilterOption {
  customer_ids: string[]
}

interface OperationInfo extends ReqCreateOperationInfo {
  operation_info_id: string
}

interface StudentFormValidator {
  ValidatorChange: () => Promise<boolean>
}

interface BaseInfoProps {
  is_look?: boolean
}
interface IconsData {
  id: string
  url: string
}
export type {
  DataNode,
  ServiceInfo,
  FilterOption,
  OperationInfo,
  CycleTime,
  CycleTimeItem,
  StudentFormValidator,
  BaseInfoProps,
  IconsData,
}
