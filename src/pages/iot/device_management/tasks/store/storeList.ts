import { makeAutoObservable } from 'mobx'
import {
  ListDeviceStrategy,
  DeviceStrategy,
  UpdateDeviceStrategyStatus,
  DeviceStrategy_Status,
  DeleteDeviceStrategy,
} from 'gm_api/src/device'
import { PaginationProps } from '@gm-pc/react'
import { DeviceStrategyFilter } from '../interface'
import { isTextNumber } from '@/pages/iot/device_management/util'

const initFilter: DeviceStrategyFilter = {
  text: '',
}

class Store {
  filter: DeviceStrategyFilter = { ...initFilter }
  list: DeviceStrategy[] = []
  constructor() {
    makeAutoObservable(this, undefined, { autoBind: true })
  }

  initData() {
    this.list = []
    this.filter = { ...initFilter }
  }

  changeFilter = <T extends keyof DeviceStrategyFilter>(
    name: T,
    value: DeviceStrategyFilter[T],
  ) => {
    this.filter[name] = value
  }

  updateStatue(device_strategy_id: string, status: DeviceStrategy_Status) {
    return UpdateDeviceStrategyStatus({
      device_strategy_id,
      status,
    })
  }

  deleteStrategy(device_strategy_id: string) {
    return DeleteDeviceStrategy({ device_strategy_id })
  }

  getStrategyList(params: PaginationProps) {
    const { text, ...other } = this.filter
    const searchText = isTextNumber(text)
      ? { device_strategy_id: text }
      : { device_strategy_name: text }
    const res = { paging: params.paging, ...other, ...searchText }
    return ListDeviceStrategy(res).then((json) => {
      this.list = json.response.device_strategys
      return json.response
    })
  }
}

export default new Store()
