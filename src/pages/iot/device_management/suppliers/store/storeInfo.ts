import { makeAutoObservable } from 'mobx'
import {
  DeviceSupplier,
  GetDeviceSupplier,
  CreateDeviceSupplier,
  UpdateDeviceSupplier,
} from 'gm_api/src/device'
import { OptionsType } from '@/pages/iot/device_management/enum'
import _ from 'lodash'

const initDeviceSupplier: DeviceSupplier = {
  iot_supplier_url: '',
  app_id: '',
  app_secret: '',
  creater_name: '',
  status: 1,
  type: undefined,
  create_time: '',
  remarks: '',
  device_supplier_id: '',
  device_supplier_name: '',
}

class Store {
  supplierInfo: DeviceSupplier = { ...initDeviceSupplier }

  constructor() {
    makeAutoObservable(this, undefined, { autoBind: true })
  }

  initData() {
    this.supplierInfo = { ...initDeviceSupplier }
  }

  changeSupplierInfo(value: DeviceSupplier) {
    return Object.assign(this.supplierInfo, { ...value })
  }

  getSupplier(supplier_id: string) {
    return GetDeviceSupplier({
      device_supplier_id: supplier_id,
    }).then((json) => {
      this.supplierInfo = { ...json.response.device_supplier }
      return null
    })
  }

  optionSupplier(type: number, value: DeviceSupplier) {
    const device_supplier = _.omitBy(this.changeSupplierInfo(value), (v) => !v)
    return type === OptionsType.create
      ? CreateDeviceSupplier({ device_supplier })
      : UpdateDeviceSupplier({
          device_supplier: device_supplier as DeviceSupplier,
        })
  }
}

export default new Store()
