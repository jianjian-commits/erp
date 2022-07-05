import { Device, DeviceAlarmRule, DeviceData_DataType } from 'gm_api/src/device'

interface DeviceDataType extends Device {
  device_alarm_rule: DeviceAlarmRule
}

interface DeviceItemType {
  value: DEVICE_ITEM_VALUE
  text: string
  dataType: DeviceData_DataType
}

interface ItemChartsType {
  [key: string]: ItemChartsDataType[]
}

interface ItemChartsDataType {
  type: string
  time: string
  value: number
  unitName: string
}

type DEVICE_ITEM_VALUE = 'humidity' | 'temperature'

export type {
  DeviceDataType,
  DeviceItemType,
  DEVICE_ITEM_VALUE,
  ItemChartsType,
  ItemChartsDataType,
}
