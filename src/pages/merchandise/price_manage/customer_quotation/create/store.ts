import { makeAutoObservable } from 'mobx'
import {
  GetQuotation,
  CreateQuotationV2,
  UpdateQuotationV2,
  Quotation,
} from 'gm_api/src/merchandise'
import { QuotaionFieldValues } from '../data'

class MenuStore {
  quotation: Quotation | any = {}

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
    const { inner_name, outer_name, description, status, type, is_default } =
      params
    const quotation = {
      inner_name,
      outer_name,
      description,
      status,
      is_default,
      type,
    }
    return CreateQuotationV2({ quotation })
  }

  update(params: QuotaionFieldValues) {
    const { inner_name, outer_name, description, status, is_default } = params

    const quotation = {
      ...this.quotation,
      inner_name,
      outer_name,
      description,
      status,
      is_default,
    }
    return UpdateQuotationV2({
      quotation,
    })
  }
}

export default new MenuStore()
