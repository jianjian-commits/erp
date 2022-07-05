import { makeAutoObservable } from 'mobx'
import {
  GetOrderCustomerMerchandiseSaleData,
  GetOrderCustomerMerchandiseSaleDataRequest,
} from 'gm_api/src/databi'
import { ExportOrderCustomerMerchandiseSaleData } from 'gm_api/src/orderlogic'
import { DiyShowMapType, SortsType } from '@gm-pc/table-x'
import { BASE_SUMMARY } from './../constants'
import { Category } from '../interface'
import { formatQueryData, getExprBySorts } from '../../util'

export type CustomerMerchandiseSaleFilter = Omit<
  GetOrderCustomerMerchandiseSaleDataRequest,
  'expr'
> &
  Category
export const INIT_SUMMARY = {
  ...BASE_SUMMARY,
}
class Store {
  filter = {} as CustomerMerchandiseSaleFilter
  expr: GetOrderCustomerMerchandiseSaleDataRequest['expr']
  summary = {
    ...INIT_SUMMARY,
  }

  constructor() {
    makeAutoObservable(this, undefined, { autoBind: true })
  }

  clear() {
    this.filter = {} as CustomerMerchandiseSaleFilter
    this.expr = undefined
    this.summary = {
      ...INIT_SUMMARY,
    }
  }

  updateFilter(params: CustomerMerchandiseSaleFilter) {
    this.filter = {
      ...params,
      need_summary_data: true,
    }
  }

  // 报表
  getList(
    params: GetOrderCustomerMerchandiseSaleDataRequest & { sorts: SortsType },
  ) {
    const { category } = this.filter
    const req = {
      ...category,
      ...params,
      need_summary_data: true,
    } as GetOrderCustomerMerchandiseSaleDataRequest
    if (params.sorts && Object.keys(params.sorts).length) {
      req.expr = this.expr = getExprBySorts(params.sorts)
    } else {
      this.expr = undefined
    }
    return GetOrderCustomerMerchandiseSaleData(req).then((json) => {
      const formatData = formatQueryData(json)
      const { summaryData } = formatData
      this.summary = { ...INIT_SUMMARY, ...summaryData }
      return formatData
    })
  }

  // 导出
  exportList(diyShowMap: DiyShowMapType) {
    return ExportOrderCustomerMerchandiseSaleData({
      fields: diyShowMap,
      filter: {
        ...this.filter,
        expr: this.expr,
      } as GetOrderCustomerMerchandiseSaleDataRequest,
    })
  }
}

export default new Store()
