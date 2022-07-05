import { makeAutoObservable } from 'mobx'
import {
  GetFinanceShouldPayData,
  GetFinanceShouldPayDataRequest,
} from 'gm_api/src/databi'
import { ExportFinanceShouldPay } from 'gm_api/src/finance'
import { DiyShowMapType, SortsType } from '@gm-pc/table-x'

import { formatQueryData, getExprBySorts } from '../../util'

import { SupplierSaleFilter } from '../interface'

const initSummary = {
  should_amount_sum: '',
  actual_amount_sum: '',
  need_amount_sum: '',
}
class Store {
  filter: SupplierSaleFilter = {}
  tableData: { [key: string]: string }[] = []
  expr: GetFinanceShouldPayDataRequest['expr']
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

  updateFilter(filter: SupplierSaleFilter) {
    this.filter = {
      ...filter,
      need_summary_data: true,
    }
  }

  /**
   *请求列表数据
   *
   * @param {(GetFinanceShouldPayDataRequest & { sorts: SortsType })} params
   * @memberof Store
   */
  handleSubmit = (
    params: GetFinanceShouldPayDataRequest & { sorts: SortsType },
  ) => {
    if (params.sorts && Object.keys(params.sorts).length) {
      params.expr = this.expr = getExprBySorts(params.sorts)
    } else {
      this.expr = undefined
    }
    return GetFinanceShouldPayData(params).then((res) => {
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
    return ExportFinanceShouldPay({
      fields: diyShowMap,
      filter: {
        ...this.filter,
        expr: this.expr,
      } as GetFinanceShouldPayDataRequest,
    })
  }
}

export default new Store()
