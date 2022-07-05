import {
  ListDeviceStrategyRequest,
  TimeType,
  DeviceStrategy,
} from 'gm_api/src/device'
import { ListDataItem } from '@gm-pc/react'

interface DeviceStrategyFilter
  extends Omit<ListDeviceStrategyRequest, 'paging'> {
  text: string
}

interface FrequencyValueType {
  oneSecond: number
  fiveSecond: number
  tenSecond: number
  oneMinute: number
  fiveMinute: number
  tenMinute: number
  free: number
}

interface FrequencyType extends ListDataItem<number> {
  strategy_frequency: number
  time_type: TimeType
}

// 频率
interface ExpandDeviceStrategy extends DeviceStrategy {
  timeSelect?: number
}

export type {
  DeviceStrategyFilter,
  FrequencyType,
  ExpandDeviceStrategy,
  FrequencyValueType,
}
