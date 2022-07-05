import { makeAutoObservable } from 'mobx'
import {
  GetOrderCustomerSaleData,
  GetOrderCustomerSaleDataRequest,
} from 'gm_api/src/databi'
import { ExportOrderCustomerSaleData } from 'gm_api/src/orderlogic'
import { DiyShowMapType, SortsType } from '@gm-pc/table-x'
import { BASE_SUMMARY } from '../constants'
import { formatQueryData, getExprBySorts } from '../../util'

export type CustomerSaleFilter = Partial<
  Pick<
    GetOrderCustomerSaleDataRequest,
    | 'time_range'
    | 'customer_name'
    | 'customer_sales_group_user_id'
    | 'need_summary_data'
  >
>
export const INIT_SUMMARY = {
  ...BASE_SUMMARY,
}
class Store {
  filter: CustomerSaleFilter = {}
  expr: GetOrderCustomerSaleDataRequest['expr']
  summary = {
    ...INIT_SUMMARY,
  }

  constructor() {
    makeAutoObservable(this, undefined, { autoBind: true })
  }

  updateFilter(params: CustomerSaleFilter) {
    this.filter = {
      ...params,
      need_summary_data: true,
    }
  }

  clear() {
    this.filter = {}
    this.expr = undefined
    this.summary = {
      ...INIT_SUMMARY,
    }
  }

  // 报表
  getList(params: GetOrderCustomerSaleDataRequest & { sorts: SortsType }) {
    const req: GetOrderCustomerSaleDataRequest = {
      ...params,
    }
    if (params.sorts && Object.keys(params.sorts).length) {
      req.expr = this.expr = getExprBySorts(params.sorts)
    } else {
      this.expr = undefined
    }
    return GetOrderCustomerSaleData(req).then((json) => {
      const formatData = formatQueryData(json)
      const { summaryData } = formatData
      this.summary = { ...INIT_SUMMARY, ...summaryData }
      return formatData
    })
  }

  // 导出
  exportList(diyShowMap: DiyShowMapType) {
    return ExportOrderCustomerSaleData({
      fields: diyShowMap,
      filter: {
        ...this.filter,
        expr: this.expr,
      } as GetOrderCustomerSaleDataRequest,
    })
  }
}

export default new Store()
