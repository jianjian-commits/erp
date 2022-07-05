import { makeAutoObservable } from 'mobx'
import {
  GetDeviceModel,
  CreateDeviceModel,
  UpdateDeviceModel,
} from 'gm_api/src/device'
import { OptionsType } from '@/pages/iot/device_management/enum'
import { DeviceModelInfo } from '../interface'
import _ from 'lodash'

const initModalInfo: DeviceModelInfo = {
  device_model_id: '',
  device_supplier_id: '',
  device_model_name: '',
  remarks: '',
  creater_name: '',
  create_time: '',
  device_supplier_name: '',
  device_strategy: undefined,
  device_type: undefined,
}

class Store {
  modalInfo: DeviceModelInfo = { ...initModalInfo }

  constructor() {
    makeAutoObservable(this, undefined, { autoBind: true })
  }

  initData() {
    this.modalInfo = { ...initModalInfo }
  }

  changeModalInfo<T extends keyof DeviceModelInfo>(
    name: T,
    value: DeviceModelInfo[T],
  ) {
    this.modalInfo[name] = value
  }

  getModel(model_id: string) {
    return GetDeviceModel({
      device_model_id: model_id,
      need_device_strategy: true,
    }).then((json) => {
      const { device_model, device_strategy } = json.response
      this.modalInfo = Object.assign(device_model, { device_strategy })
      return null
    })
  }

  optionModal(type: number) {
    const device_model = _.omitBy(this.modalInfo, (v) => !v)
    return type === OptionsType.create
      ? CreateDeviceModel({ device_model })
      : UpdateDeviceModel({
          device_model: device_model as DeviceModelInfo,
        })
  }
}

export default new Store()
