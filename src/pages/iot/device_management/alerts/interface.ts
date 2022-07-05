import {
  ListDeviceAlarmRuleRequest,
  DeviceAlarmRule_StrategyData,
  DeviceDataType,
  DeviceData_DataType,
} from 'gm_api/src/device'
import { ListDataItem } from '@gm-pc/react'

interface DeviceAlarmRuleFilter
  extends Omit<ListDeviceAlarmRuleRequest, 'paging'> {
  text: string
}

interface CellProps {
  name?: keyof Pick<
    DeviceAlarmRule_StrategyData,
    'standard_value' | 'upper_limit_value' | 'lower_limit_value'
  >
  data: DeviceAlarmRule_StrategyData
  index: number
}

type ExpandDeviceDataType = DeviceDataType & ListDataItem<DeviceData_DataType>

export type { DeviceAlarmRuleFilter, CellProps, ExpandDeviceDataType }
