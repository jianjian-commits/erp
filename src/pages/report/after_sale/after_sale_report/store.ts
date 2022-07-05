import { makeAutoObservable } from 'mobx'
import _ from 'lodash'
import moment from 'moment'
import {
  ListAfterSaleOrderSheet,
  ExportAfterSaleOrderSheet,
} from 'gm_api/src/aftersale'
import { ListQuotationV2, Quotation } from 'gm_api/src/merchandise'
import { MoreSelectDataItem } from '@gm-pc/react'

export interface FilterOption {
  begin_time: Date
  end_time: Date
  time_type: number
  q?: string
  customer_id: string
  customer_name: string
  merchants_id?: string
  quotation_ids?: MoreSelectDataItem<any>[]
  customers: any
}

export interface levelList {
  value: string
  text: string
  children?: levelList[]
}

class Store {
  filter: FilterOption = {
    time_type: 2,
    begin_time: moment().startOf('day').toDate(),
    end_time: moment().endOf('day').toDate(),
    q: '',
    customer_id: '',
    customer_name: '',
    customers: {},
    merchants_id: '',
    quotation_ids: [],
  }

  report_list: any[] = []

  quotationList: levelList[] = [] // 报价单

  summary = {
    order_num: 0, // 售后订单数
    sku_num: 0, // 售后商品数
    should_refund_amount: 0, // 应退金额
    real_refund_amount: 0, // 实退金额
  }

  constructor() {
    makeAutoObservable(this, undefined, { autoBind: true })
  }

  updateFilter<T extends keyof FilterOption>(key: T, value: FilterOption[T]) {
    this.filter[key] = value
  }

  reSetFilter() {
    this.filter.customer_name = ''
    this.filter.customer_id = ''
  }

  getSearchData() {
    const {
      time_type,
      begin_time,
      end_time,
      customers,
      merchants_id,
      quotation_ids,
    } = this.filter
    return {
      time_type,
      begin_time: `${+begin_time}`,
      end_time: `${+end_time}`,
      customer_id: customers ? customers?.value : undefined,
      // customer_name: customer_name || undefined,
      customer_label_ids: merchants_id ? [merchants_id] : undefined,
      quotation_ids:
        (quotation_ids?.length && _.map(quotation_ids, (it) => it.value)) ||
        undefined,
    }
  }

  // 报表
  fetchReportList() {
    const req = { ...this.getSearchData(), paging: { limit: 999 } }
    return ListAfterSaleOrderSheet(req).then((json) => {
      const { order_num, sku_num, should_refund_amount, real_refund_amount } =
        json.response
      this.summary = {
        order_num: Number(order_num!),
        sku_num: Number(sku_num!),
        should_refund_amount: Number(should_refund_amount),
        real_refund_amount: Number(real_refund_amount),
      }
      return json.response
    })
  }

  // 导出
  export() {
    return ExportAfterSaleOrderSheet({
      ...this.getSearchData(),
    })
  }

  fetchQuotationList() {
    const req = { paging: { limit: 999 } }
    ListQuotationV2(req).then((json) => {
      const quotation = _.map(json.response.quotations, (item: Quotation) => {
        return {
          value: item.quotation_id,
          text: item.inner_name || '',
        }
      })
      this.quotationList = quotation
      return json.response
    })
  }

  doRequest = () => {}

  setDoRequest(func: () => void) {
    this.doRequest = func
  }
}

export default new Store()
