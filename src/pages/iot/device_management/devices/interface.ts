import {
  ListDeviceRequest,
  Device,
  DeviceData,
  DeviceAlarmRule,
  DeviceModel,
} from 'gm_api/src/device'
import { ListDataItem } from '@gm-pc/react'

type DeviceFilter = Omit<ListDeviceRequest, 'paging'>

interface ExpandDevice extends Device {
  device_datas?: DeviceData[]
  device_alarm_rule?: DeviceAlarmRule
}

type SelectDeviceModel = DeviceModel & ListDataItem<string>

type SelectDeviceAlarmRule = DeviceAlarmRule & ListDataItem<string>

export type {
  DeviceFilter,
  ExpandDevice,
  SelectDeviceModel,
  SelectDeviceAlarmRule,
}
