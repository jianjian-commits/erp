import { makeAutoObservable } from 'mobx'
import { DiyShowMapType, SortsType } from '@gm-pc/table-x'

import {
  GetOrderSynthesizeSaleData,
  GetOrderSynthesizeSaleDataRequest,
} from 'gm_api/src/databi'
import { ExportOrderSynthesizeSaleData } from 'gm_api/src/orderlogic'
import { formatQueryData, getExprBySorts } from '../../util'
import { SynthesizeSaleFilter } from './types'
import { BASE_SUMMARY } from '../constants'

export const INIT_SUMMARY = {
  ...BASE_SUMMARY,
  after_sale_return_refund_count: '-', // 退货退款单数
  after_sale_refund_count: '-', // 仅退款单数
  order_average_price: '-', // 订单均价
  per_customer_transaction: '-', // 客单价
  sku_id_count: '-', // 下单商品数
  order_customer_count: '-', // 下单客户数
  detail_sum_tax_price_sum: '-', // 销售税额
}
class Store {
  filter = {} as SynthesizeSaleFilter
  expr: GetOrderSynthesizeSaleDataRequest['expr']
  summary = {
    ...INIT_SUMMARY,
  }

  constructor() {
    makeAutoObservable(this, undefined, { autoBind: true })
  }

  clear() {
    this.filter = {} as SynthesizeSaleFilter
    this.expr = undefined
    this.summary = {
      ...INIT_SUMMARY,
    }
  }

  updateFilter(params: SynthesizeSaleFilter) {
    this.filter = {
      ...params,
      need_summary_data: true,
    }
  }

  // 报表
  getList(params: GetOrderSynthesizeSaleDataRequest & { sorts: SortsType }) {
    const req: GetOrderSynthesizeSaleDataRequest = {
      ...params,
    }
    if (params.sorts && Object.keys(params.sorts).length) {
      req.expr = this.expr = getExprBySorts(params.sorts)
    } else {
      this.expr = undefined
    }
    return GetOrderSynthesizeSaleData(req).then((json) => {
      const formatData = formatQueryData(json)
      const { summaryData } = formatData
      this.summary = { ...INIT_SUMMARY, ...summaryData }
      return formatData
    })
  }

  // 导出
  exportList(diyShowMap: DiyShowMapType) {
    return ExportOrderSynthesizeSaleData({
      fields: diyShowMap,
      filter: {
        ...this.filter,
        expr: this.expr,
      } as GetOrderSynthesizeSaleDataRequest,
    })
  }
}

export default new Store()
