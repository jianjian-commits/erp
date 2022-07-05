import { makeAutoObservable } from 'mobx'
import {
  GetDevice,
  CreateDevice,
  UpdateDevice,
  ListDeviceModel,
  ListDeviceAlarmRule,
} from 'gm_api/src/device'
import { OptionsType } from '@/pages/iot/device_management/enum'
import _ from 'lodash'
import {
  ExpandDevice,
  SelectDeviceModel,
  SelectDeviceAlarmRule,
} from '../interface'

const initDeviceInfo: ExpandDevice = {
  device_id: '',
  device_name: '',
  region: '',
  device_serial_no: '',
  device_key: '',
  device_mac: '',
  device_alarm_rule_id: '0',
  device_model_id: undefined,
  remarks: '',
}

class Store {
  deviceInfo: ExpandDevice = { ...initDeviceInfo }

  ModelData: SelectDeviceModel[] = []

  AlarmRuleData: SelectDeviceAlarmRule[] = []

  constructor() {
    makeAutoObservable(this, undefined, { autoBind: true })
  }

  initData() {
    this.deviceInfo = { ...initDeviceInfo }
    this.ModelData = []
    this.AlarmRuleData = []
  }

  changeDeviceInfo<T extends keyof ExpandDevice>(
    name: T,
    value: ExpandDevice[T],
  ) {
    this.deviceInfo[name] = value
  }

  changeDeviceInfos(value: ExpandDevice) {
    this.deviceInfo = value
  }

  getDevice(device_id: string) {
    return GetDevice({ device_id, need_newest_data: true }).then((json) => {
      const { device, device_alarm_rule, device_datas } = json.response
      this.deviceInfo = Object.assign(device, {
        device_alarm_rule,
        device_datas,
      })
      return null
    })
  }

  getModel() {
    return ListDeviceModel({
      device_supplier_id: this.deviceInfo.device_supplier_id,
      paging: { limit: 999 },
    }).then((json) => {
      this.ModelData = _.map(json.response.device_models, (data) => ({
        value: data.device_model_id,
        text: data.device_model_name!,
        ...data,
      }))
      return null
    })
  }

  getAlarmRule(device_model_id?: string) {
    ListDeviceAlarmRule({
      device_model_id: device_model_id ?? this.deviceInfo.device_model_id,
      paging: { limit: 999 },
    }).then((json) => {
      json.response.device_alarm_rules.unshift({
        device_alarm_rule_id: '0',
        device_alarm_rule_name: '无',
      })
      this.AlarmRuleData = _.map(json.response.device_alarm_rules, (data) => ({
        value: data.device_alarm_rule_id,
        text: data.device_alarm_rule_name!,
        ...data,
      }))
      return null
    })
  }

  optionStrategy(type: number) {
    const device = _.omitBy(this.deviceInfo, (v) => !v)
    return type === OptionsType.create
      ? CreateDevice({ device })
      : UpdateDevice({
          device: device as ExpandDevice,
        })
  }
}

export default new Store()
