import { makeAutoObservable } from 'mobx'
import {
  GetDeviceAlarmRule,
  CreateDeviceAlarmRule,
  UpdateDeviceAlarmRule,
  DeviceAlarmRule,
  DeviceAlarmRule_StrategyData,
  ListDeviceDataType,
  DeviceAlarmRule_StrategyType,
  TimeType,
  map_DeviceData_DataType,
  DeviceData_DataType,
} from 'gm_api/src/device'
import { OptionsType } from '@/pages/iot/device_management/enum'
import { ExpandDeviceDataType } from '../interface'
import _ from 'lodash'

const initAlarmRuleInfo: DeviceAlarmRule = {
  device_alarm_rule_id: '',
  device_alarm_rule_name: '',
  device_model_id: undefined,
  remarks: '',
  status: undefined,
}

const initDeviceData: DeviceAlarmRule_StrategyData = {
  unit_name: undefined,
  upper_limit_value: undefined,
  standard_value: undefined,
  lower_limit_value: undefined,
  strategy_type: DeviceAlarmRule_StrategyType.STRATEGYTYPE_CONTINUOUS_NUMBER,
  continuous_time: { time_type: TimeType.TIMETYPE_SECOND, time: 1 },
  continuous_number: { number: 1 },
}

class Store {
  alarmRuleInfo: DeviceAlarmRule = { ...initAlarmRuleInfo }

  strategyData: DeviceAlarmRule_StrategyData[] = []

  deviceData: ExpandDeviceDataType[] = []

  constructor() {
    makeAutoObservable(this, undefined, { autoBind: true })
  }

  initData() {
    this.alarmRuleInfo = { ...initAlarmRuleInfo }
    this.strategyData = []
    this.deviceData = []
  }

  changeAlarmRuleInfo<T extends keyof DeviceAlarmRule>(
    name: T,
    value: DeviceAlarmRule[T],
  ) {
    if (name === 'device_model_id') {
      this.getDeviceDataType(value as string)
      this.strategyData = []
    }
    this.alarmRuleInfo[name] = value
  }

  changeStrategyData<T extends keyof DeviceAlarmRule_StrategyData>(
    name: T,
    value: DeviceAlarmRule_StrategyData[T],
    index: number,
  ) {
    if (name === 'data_type') {
      const data = _.find(this.deviceData, { value: value as number })
      this.strategyData[index] = Object.assign(this.strategyData[index], {
        data_type: value,
        unit_name: data?.unit_name,
      })
      this.changeDisableData(value as DeviceData_DataType)
      return
    }
    this.strategyData[index][name] = value
  }

  addRuleList() {
    this.strategyData.push({ ...initDeviceData })
  }

  deleteRule(index: number) {
    const data_type = this.strategyData[index]?.data_type
    data_type && this.changeDisableData(data_type, true)
    this.strategyData.splice(index, 1)
  }

  getDeviceDataType(model_id?: string, edit?: boolean) {
    return ListDeviceDataType({
      device_model_id: model_id ?? this.alarmRuleInfo.device_model_id,
    }).then((json) => {
      this.deviceData = _.map(json.response.device_data_types, (item) => ({
        value: item.data_type!,
        text: map_DeviceData_DataType[item.data_type!],
        disabled: edit
          ? !!_.find(this.strategyData, { data_type: item.data_type })
          : false,
        ...item,
      }))
      return null
    })
  }

  getAlarmRule(alarm_rule_id: string) {
    return GetDeviceAlarmRule({ device_alarm_rule_id: alarm_rule_id }).then(
      (json) => {
        const { device_alarm_rule } = json.response
        this.alarmRuleInfo = device_alarm_rule
        this.strategyData = device_alarm_rule!.strategy_datas!.strategy_datas!
        return null
      },
    )
  }

  optionAlarmRule(type: number) {
    const {
      device_alarm_rule_id,
      strategy_datas,
      ...other
    } = this.alarmRuleInfo
    const device_alarm_rule = {
      device_alarm_rule_id:
        type === OptionsType.create ? undefined : device_alarm_rule_id,
      strategy_datas: { strategy_datas: this.strategyData },
      ...other,
    }
    return type === OptionsType.create
      ? CreateDeviceAlarmRule({ device_alarm_rule })
      : UpdateDeviceAlarmRule({
          device_alarm_rule: device_alarm_rule as DeviceAlarmRule,
        })
  }

  changeDisableData(data_type: DeviceData_DataType, isDisable = false) {
    this.deviceData[_.findIndex(this.deviceData, { data_type })].disabled =
      !isDisable ?? true
  }
}

export default new Store()
