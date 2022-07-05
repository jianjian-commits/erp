import {
  ListDeviceModelRequest,
  DeviceModel,
  DeviceStrategy,
} from 'gm_api/src/device'

type DeviceModelFilter = Omit<ListDeviceModelRequest, 'paging'>

interface DeviceModelInfo extends DeviceModel {
  device_strategy?: DeviceStrategy
}

export type { DeviceModelFilter, DeviceModelInfo }
