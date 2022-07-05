import { makeAutoObservable } from 'mobx'
import {
  GetFinanceShouldReceiveData,
  GetFinanceShouldReceiveDataRequest,
} from 'gm_api/src/databi'
import { ExportFinanceShouldReceive } from 'gm_api/src/finance'
import { DiyShowMapType, SortsType } from '@gm-pc/table-x'

import { formatQueryData, getExprBySorts } from '../../util'
import { CustomerSaleFilter } from '../interface'

const initSummary = {
  actual_amount_sum: '',
  need_amount_sum: '',
  refund_amount_sum: '',
  sale_price_sum: '',
}
class Store {
  filter: CustomerSaleFilter = {}
  tableData: { [key: string]: string }[] = []
  expr: GetFinanceShouldReceiveDataRequest['expr']
  summary = {
    ...initSummary,
  }

  constructor() {
    makeAutoObservable(this, undefined, { autoBind: true })
  }

  clear() {
    this.filter = {}
    this.summary = { ...initSummary }
  }

  updateFilter(filter: CustomerSaleFilter) {
    this.filter = {
      ...filter,
      need_summary_data: true,
    }
  }

  /**
   *请求列表数据
   *
   * @param {(GetFinanceShouldReceiveDataRequest & { sorts: SortsType })} params
   * @memberof Store
   */
  handleSubmit = (
    params: GetFinanceShouldReceiveDataRequest & { sorts: SortsType },
  ) => {
    if (params.sorts && Object.keys(params.sorts).length) {
      params.expr = this.expr = getExprBySorts(params.sorts)
    } else {
      this.expr = undefined
    }
    return GetFinanceShouldReceiveData(params).then((res) => {
      const result = formatQueryData(res)
      this.summary = result.summaryData
      return result
    })
  }

  /**
   *导出
   *
   * @param {DiyShowMapType} diyShowMap
   * @memberof Store
   */
  handleExport = (diyShowMap: DiyShowMapType) => {
    return ExportFinanceShouldReceive({
      fields: diyShowMap,
      filter: {
        ...this.filter,
        expr: this.expr,
      } as GetFinanceShouldReceiveDataRequest,
    })
  }
}

export default new Store()
