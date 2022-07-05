import { makeAutoObservable } from 'mobx'
import {
  GetDeviceStrategy,
  CreateDeviceStrategy,
  UpdateDeviceStrategy,
  DeviceStrategy_Type,
} from 'gm_api/src/device'
import { OptionsType } from '@/pages/iot/device_management/enum'
import _ from 'lodash'
import { ExpandDeviceStrategy } from '../interface'
import { FrequencySelect, FrequencyValue } from '../enum'

const initStrategyInfo: ExpandDeviceStrategy = {
  device_strategy_id: '',
  device_strategy_name: '',
  type: DeviceStrategy_Type.TYPE_COLLECTION,
  remarks: '',
  device_model_id: '',
  collection_type: undefined,
  strategy_frequency: 1,
  time_type: undefined,
  status: undefined,
  create_time: '',
  creater_name: '',
  timeSelect: undefined, // 频率
}

class Store {
  strategyInfo: ExpandDeviceStrategy = { ...initStrategyInfo }

  constructor() {
    makeAutoObservable(this, undefined, { autoBind: true })
  }

  initData() {
    this.strategyInfo = { ...initStrategyInfo }
  }

  changeStrategyInfo<T extends keyof ExpandDeviceStrategy>(
    name: T,
    value: ExpandDeviceStrategy[T],
  ) {
    if (name === 'timeSelect') {
      const data = _.find(FrequencySelect, {
        value: value as number,
      })
      this.strategyInfo = Object.assign(this.strategyInfo, {
        strategy_frequency: data?.strategy_frequency,
        time_type: data?.time_type,
      })
    }
    this.strategyInfo[name] = value
  }

  changeStrategyTime(value: number) {
    this.strategyInfo = {
      ...this.strategyInfo,
      strategy_frequency: 1,
      time_type: value,
    }
  }

  getStrategy(strategy_id: string) {
    return GetDeviceStrategy({
      device_strategy_id: strategy_id,
    }).then((json) => {
      const { device_strategy } = json.response
      const data = _.find(FrequencySelect, {
        strategy_frequency: device_strategy.strategy_frequency,
        time_type: device_strategy.time_type,
      })
      this.strategyInfo = Object.assign(device_strategy, {
        timeSelect: data ? data?.value : FrequencyValue.free,
      })
      return null
    })
  }

  optionStrategy(type: number) {
    const device_strategy = _.omitBy(this.strategyInfo, (v) => !v)
    return type === OptionsType.create
      ? CreateDeviceStrategy({ device_strategy })
      : UpdateDeviceStrategy({
          device_strategy: device_strategy as ExpandDeviceStrategy,
        })
  }
}

export default new Store()
