import { makeAutoObservable } from 'mobx'
import {
  ListDevice,
  Device,
  UpdateDeviceEnableStatus,
  UpdateDeviceAlarmEnableStatus,
  Device_AlarmEnableStatus,
  Device_EnableStatus,
  DeleteDevice,
} from 'gm_api/src/device'
import { PaginationProps } from '@gm-pc/react'
import { DeviceFilter } from '../interface'

class Store {
  filter: DeviceFilter = {}
  list: Device[] = []

  constructor() {
    makeAutoObservable(this, undefined, { autoBind: true })
  }

  initData() {
    this.list = []
    this.filter = {}
  }

  changeFilter = <T extends keyof DeviceFilter>(
    name: T,
    value: DeviceFilter[T],
  ) => {
    this.filter[name] = value
  }

  updateEnableStatus(device_id: string, enable_status: Device_EnableStatus) {
    return UpdateDeviceEnableStatus({
      device_id,
      enable_status,
    })
  }

  updateAlarmEnableStatus(
    device_id: string,
    alarm_enable_status: Device_AlarmEnableStatus,
  ) {
    return UpdateDeviceAlarmEnableStatus({
      device_id,
      alarm_enable_status,
    })
  }

  deleteDevice(device_id: string) {
    return DeleteDevice({ device_id })
  }

  getDeviceList(params: PaginationProps) {
    const res = { paging: params.paging, ...this.filter }
    return ListDevice(res).then((json) => {
      this.list = json.response.devices
      return json.response
    })
  }
}

export default new Store()
