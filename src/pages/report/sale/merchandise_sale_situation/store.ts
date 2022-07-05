import { makeAutoObservable } from 'mobx'
import {
  GetOrderMerchandiseSaleData,
  GetOrderMerchandiseSaleDataRequest,
} from 'gm_api/src/databi'
import { ExportOrderMerchandiseSaleData } from 'gm_api/src/orderlogic'
import { DiyShowMapType, SortsType } from '@gm-pc/table-x'
import { formatQueryData, getExprBySorts } from '../../util'
import { BASE_SUMMARY } from '../constants'
import { Category } from '../interface'
export type MerchandiseSaleFilter = Omit<
  GetOrderMerchandiseSaleDataRequest,
  'expr'
> &
  Category

export const INIT_SUMMARY = {
  ...BASE_SUMMARY,
  unit_measuring_quantity_sum: '-', // 计量单位下单数
  unit_measuring_pre_price_avg: '-', // 计量单位单价
  unit_measuring_outstock_quantity_sum: '-', // 出库数（计量单位）
  outstock_per_cost_price_avg: '-', // 出库成本单价
}
class Store {
  filter = {} as MerchandiseSaleFilter
  expr: GetOrderMerchandiseSaleDataRequest['expr']
  summary = { ...INIT_SUMMARY }

  constructor() {
    makeAutoObservable(this, undefined, { autoBind: true })
  }

  clear() {
    this.filter = {} as MerchandiseSaleFilter
    this.expr = undefined
    this.summary = {
      ...INIT_SUMMARY,
    }
  }

  updateFilter(params: MerchandiseSaleFilter) {
    this.filter = { ...params, need_summary_data: true }
  }

  // 报表
  getList(params: GetOrderMerchandiseSaleDataRequest & { sorts: SortsType }) {
    const { category } = this.filter
    const req: GetOrderMerchandiseSaleDataRequest = {
      ...category,
      ...params,
      paging: params.paging,
      need_summary_data: true,
    }
    if (params.sorts && Object.keys(params.sorts).length) {
      req.expr = this.expr = getExprBySorts(params.sorts)
    } else {
      this.expr = undefined
    }
    return GetOrderMerchandiseSaleData(req).then((json) => {
      const formatData = formatQueryData(json)
      const { summaryData } = formatData
      this.summary = { ...INIT_SUMMARY, ...summaryData }
      return formatData
    })
  }

  // 导出
  exportList(diyShowMap: DiyShowMapType) {
    const { category } = this.filter
    return ExportOrderMerchandiseSaleData({
      fields: diyShowMap,
      filter: {
        ...category,
        ...this.filter,
        expr: this.expr,
      } as GetOrderMerchandiseSaleDataRequest,
    })
  }
}

export default new Store()
