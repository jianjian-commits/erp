import { Response } from '@gm-common/x-request'
import {
  ListDeviceGroupByType,
  ListDeviceGroupByTypeResponse,
  ListDeviceGroupByTypeResponse_DeviceGroup,
} from 'gm_api/src/device'
import { action, computed, makeAutoObservable } from 'mobx'

/**
 * 数据页面的Store类，用于数据页面的操作
 */
class DataStore {
  /** 当前的设备组集合 */
  private _deviceGroups: ListDeviceGroupByTypeResponse_DeviceGroup[] = []

  /**
   * @class
   */
  constructor() {
    makeAutoObservable(this)
  }

  /**
   * 获取当前的设备组集合，_deviceGroups的get方法
   * @return {ListDeviceGroupByTypeResponse_DeviceGroup[]} 设备组的集合
   */
  @computed get deviceGroups(): ListDeviceGroupByTypeResponse_DeviceGroup[] {
    return this._deviceGroups
  }

  /**
   * 设置当前的设备组集合，_deviceGroups的set方法
   * @param {ListDeviceGroupByTypeResponse_DeviceGroup[]} 设备组的集合
   */
  @action
  setDeviceGroups(
    deviceGroups: ListDeviceGroupByTypeResponse_DeviceGroup[],
  ): void {
    this._deviceGroups = deviceGroups
  }

  /**
   * 获取设备组的集合
   */
  @action
  fetchDeviceGroups(): void {
    ListDeviceGroupByType().then(
      (response: Response<ListDeviceGroupByTypeResponse>) => {
        const device_groups = response?.response?.device_groups || []
        device_groups.sort(
          (prev, next) =>
            (prev.device_type as number) - (next.device_type as number),
        )
        this.setDeviceGroups(device_groups)
        return null
      },
    )
  }
}

export default new DataStore()
