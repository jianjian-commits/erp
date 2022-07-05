import { action, observable, makeAutoObservable } from 'mobx'
import { rulesetOptions } from '../../interface'

const initDetail = {
  rule_set_display_id: '',
  rule_set_id: '',
  rule_set_name: '',
  create_time: '',
  quotation_id: '',
  quotation_name: '',
  state: 1,
  service_period_ids: [''],
}

class DetailStore {
  detail: rulesetOptions = initDetail

  quotationList = []

  serviceTimeList = []

  constructor() {
    makeAutoObservable(this, undefined, { autoBind: true })
  }

  getDetail(id: string) {
    this.detail = {
      rule_set_display_id: 'R1111',
      rule_set_id: 'R1111',
      rule_set_name: 'A客户协议单',
      create_time: '2020-09-20',
      quotation_id: 'Q111',
      quotation_name: 'A客户报价单',
      state: 1,
      service_period_ids: ['S111'],
    }
  }

  changeRule(name: string, value: any) {
    this.detail[name] = value
  }
}

export default new DetailStore()
