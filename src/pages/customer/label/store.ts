import { t } from 'gm-i18n'
import { makeAutoObservable } from 'mobx'
import {
  ListCustomerLabel,
  CustomerLabel,
  DeleteCustomerLabel,
  CreateCustomerLabel,
} from 'gm_api/src/enterprise'
import type { PagingParams } from 'gm_api/src/common'
import { Tip } from '@gm-pc/react'

class Store {
  search_text = ''
  count = 0
  list: CustomerLabel[] = []
  labelName = ''

  handleSearchText = (value: string) => {
    this.search_text = value
  }

  handleLabelName = (value: string) => {
    this.labelName = value
  }

  fetchList = (params: PagingParams) => {
    const req = { ...params, q: this.search_text }
    return ListCustomerLabel(req).then((json) => {
      if (json.response.paging?.count) {
        this.count = json.response.paging?.count
      }
      this.list = json.response.customer_labels

      return json.response
    })
  }

  constructor() {
    makeAutoObservable(this, undefined, { autoBind: true })
  }

  createCustomerLabel() {
    const req = { customer_label: { name: this.labelName } }
    this.labelName = ''
    return CreateCustomerLabel(req).then(() => Tip.success(t('新建成功')))
  }

  delCustomerLabel(id: string) {
    return DeleteCustomerLabel({ customer_label_id: id })
  }
}

export default new Store()
