import { t } from 'gm-i18n'
import { makeAutoObservable } from 'mobx'
import { RadioCheckType, WhiteListType } from './interface'
import {
  ListAfterSaleSettings,
  UpdateAfterSaleSettings,
} from 'gm_api/src/preference'
import {
  AfterSaleSettings,
  AfterSaleSettings_WhiteListType,
} from 'gm_api/src/preference/types'
import _ from 'lodash'

class AfterSettingStore {
  constructor() {
    makeAutoObservable(this, undefined, { autoBind: true })
  }

  after_sale_settings: AfterSaleSettings = {
    after_sale_settings_id: '',
    group_id: '',
    station_id: '',
  }

  // 报价单列表
  // quotation_map: any = {}
  newTreeData: any = []

  // 售后申请审核流程
  radioCheck: RadioCheckType = {
    value: this.after_sale_settings.status || 256,
  }

  whitListRadio: WhiteListType = {
    value: AfterSaleSettings_WhiteListType.WHITE_LIST_TYPE_QUOTATION,
  }

  quotation_relations: any = []

  quotation_map: any = []

  customers: any = []

  selected: string[] = []

  setRadioValue(value: number): void {
    this.radioCheck.value = value
    this.after_sale_settings.status = '' + value
  }

  setWhitListRadioValue(value: number): any {
    this.newTreeData = []
    this.whitListRadio.value = value
    this.after_sale_settings.white_list_type = value
    if (value === 1) {
      this.getListAfterSaleSettings()
    }
    if (value === 2) {
      const { customers } = this
      if (!customers.length) return null
      _.map(customers, (v) => {
        this.newTreeData.push({
          value: v.customer_id,
          text: v.name,
        })
      })
      _.forEach(this.newTreeData, (item) => {
        _.forEach(this.quotation_relations, (v) => {
          if (v.customer_id === item.value) {
            _.forEach(this.quotation_map, (c) => {
              if (v.quotation_id === c.quotation_id) {
                c.value = c.quotation_id
                c.text = c.inner_name
                item.children = []
                item.children.push(c)
              }
            })
          }
        })
      })
    }
  }

  onSelected(selected: string[]) {
    const { customer_ids } = this.after_sale_settings
    this.selected = selected
    customer_ids.customer_ids = this.selected
  }

  handleChildren(quotation_map: any): any {
    this.newTreeData = []
    if (quotation_map.length) return null
    _.map(quotation_map, (v) => {
      this.newTreeData.push({
        value: v.quotation_id,
        text: v.inner_name,
      })
    })
  }

  handleAddChildren(quotation_relations: any, customers: any): any {
    _.forEach(this.newTreeData, (v) => {
      _.forEach(quotation_relations, (item) => {
        if (v.value === item.quotation_id) {
          _.forEach(customers, (c) => {
            if (c.customer_id === item.customer_id) {
              item.value = c.customer_id
              item.text = c.name
              v.children = []
              v.children.push(item)
            }
          })
        }
      })
    })
  }

  getListAfterSaleSettings(): any {
    return ListAfterSaleSettings().then((json) => {
      const res = json.response
      this.after_sale_settings = res.after_sale_settings[0]
      this.quotation_relations = res.list_customer_response?.quotation_relations
      this.quotation_map = res.quotation_map
      this.customers = res.list_customer_response?.customers
      this.handleChildren(this.quotation_map)
      this.handleAddChildren(this.quotation_relations, this.customers)
      return null
    })
  }

  handleSubmit(): any {
    if (this.after_sale_settings.status === '0') {
      this.after_sale_settings.white_list_type = 0
    }
    return UpdateAfterSaleSettings({
      after_sale_settings: this.after_sale_settings,
    }).then((json) => {
      const res = json.response
      return null
    })
  }
}
export default new AfterSettingStore()
