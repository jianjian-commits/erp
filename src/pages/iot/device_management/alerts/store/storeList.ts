import { makeAutoObservable } from 'mobx'
import {
  ListDeviceAlarmRule,
  DeviceAlarmRule,
  UpdateDeviceAlarmRuleStatus,
  DeviceAlarmRule_Status,
  DeleteDeviceAlarmRule,
} from 'gm_api/src/device'
import { PaginationProps } from '@gm-pc/react'
import { DeviceAlarmRuleFilter } from '../interface'
import { isTextNumber } from '@/pages/iot/device_management/util'

const initFilter: DeviceAlarmRuleFilter = {
  text: '',
}

class Store {
  filter: DeviceAlarmRuleFilter = { ...initFilter }
  list: DeviceAlarmRule[] = []

  constructor() {
    makeAutoObservable(this, undefined, { autoBind: true })
  }

  initData() {
    this.list = []
    this.filter = { ...initFilter }
  }

  changeFilter = <T extends keyof DeviceAlarmRuleFilter>(
    name: T,
    value: DeviceAlarmRuleFilter[T],
  ) => {
    this.filter[name] = value
  }

  handleUpdateState(
    device_alarm_rule_id: string,
    status: DeviceAlarmRule_Status,
  ) {
    return UpdateDeviceAlarmRuleStatus({
      device_alarm_rule_id,
      status,
    })
  }

  deleteAlarmRule(device_alarm_rule_id: string) {
    return DeleteDeviceAlarmRule({ device_alarm_rule_id })
  }

  getAlarmRuleList(params: PaginationProps) {
    const { text, sortby } = this.filter
    const searchText = isTextNumber(text)
      ? { device_alarm_rule_id: text }
      : { device_alarm_rule_name: text }
    const res = { paging: params.paging, sortby, ...searchText }
    return ListDeviceAlarmRule(res).then((json) => {
      this.list = json.response.device_alarm_rules
      return json.response
    })
  }
}

export default new Store()
