import { makeAutoObservable } from 'mobx'
import {
  GetQuotation,
  CreateQuotation,
  UpdateQuotation,
  Quotation_Type,
} from 'gm_api/src/merchandise'
import { QuotationProps } from '../types'
import { QuotaionFieldValues } from '../data'

class MenuStore {
  quotation: QuotationProps | any = {}

  customer_ids: string[] = []

  constructor() {
    makeAutoObservable(this, undefined, { autoBind: true })
  }

  /** 获取报价单详情 */
  getQuotation(quotation_id: string) {
    return GetQuotation({ quotation_id }).then((json) => {
      this.quotation = json.response.quotation || { quotation_id: '' }
      this.customer_ids = json.response.customer_ids || []
      return json.response
    })
  }

  clearStore() {
    this.quotation = {}

    this.customer_ids = []
  }

  create(params: QuotaionFieldValues) {
    const { inner_name, outer_name, description, is_active } = params
    const quotation = {
      inner_name,
      outer_name,
      description,
      is_active,
      type: Quotation_Type.WITHOUT_TIME,
    }
    return CreateQuotation({ quotation })
  }

  update(params: QuotaionFieldValues) {
    const { inner_name, outer_name, description, is_active } = params

    const quotation = {
      ...this.quotation,
      inner_name,
      outer_name,
      description,
      is_active,
    }
    return UpdateQuotation({
      quotation,
      customer_ids: this.customer_ids,
    })
  }
}

export default new MenuStore()
