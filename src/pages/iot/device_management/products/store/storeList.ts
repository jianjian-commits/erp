import { makeAutoObservable } from 'mobx'
import {
  ListDeviceModel,
  DeviceModel,
  DeleteDeviceModel,
} from 'gm_api/src/device'
import { DeviceModelFilter } from '../interface'
import { PaginationProps } from '@gm-pc/react'
import _ from 'lodash'

const initFilter: DeviceModelFilter = {
  device_supplier_id: '0',
  device_model_name: '',
  device_type: undefined,
}

class Store {
  filter: DeviceModelFilter = { ...initFilter }

  list: DeviceModel[] = []

  constructor() {
    makeAutoObservable(this, undefined, { autoBind: true })
  }

  initData() {
    this.filter = { ...initFilter }
    this.list = []
  }

  changeFilter<T extends keyof DeviceModelFilter>(
    name: T,
    value: DeviceModelFilter[T],
  ) {
    this.filter[name] = value
  }

  deleteModel(device_model_id: string) {
    return DeleteDeviceModel({ device_model_id })
  }

  getModelList(params: PaginationProps) {
    const { device_supplier_id } = this.filter
    const isNoSupplier = device_supplier_id === '-1'
    const res = {
      ...this.filter,
      paging: params.paging,
      is_no_supplier: isNoSupplier,
      device_supplier_id: isNoSupplier ? undefined : device_supplier_id,
    }
    return ListDeviceModel(res).then((json) => {
      this.list = json.response.device_models
      return json.response
    })
  }
}

export default new Store()
