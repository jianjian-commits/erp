import { makeAutoObservable } from 'mobx'
import {
  GetFinanceShouldPayDataRequest,
  GetTotalShouldReport,
  ListReportForm,
} from 'gm_api/src/databi'
import { ExportFinanceShouldPay } from 'gm_api/src/finance'
import { DiyShowMapType } from '@gm-pc/table-x'

import { getReportForm } from '../../util'
import { SupplierSaleLiteFilter } from '../interface'

const initSummary = {
  total_amount: '',
  total_already_amount: '',
  total_not_amount: '',
}
class Store {
  filter: SupplierSaleLiteFilter = {}
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

  updateFilter(filter: SupplierSaleLiteFilter) {
    this.filter = {
      ...filter,
      account_type: 1,
    }
  }

  /**
   *请求列表数据
   *
   * @param {(GetFinanceShouldPayDataRequest & { sorts: SortsType })} params
   * @memberof Store
   */
  handleSubmit = (params: any) => {
    const {
      time_range: { begin_time, end_time },
      account_type,
      supplier_name,
      paging,
    } = params
    const req = {
      create_time: begin_time,
      end_time,
      account_type,
      q: supplier_name,
    }
    GetTotalShouldReport(req).then((json) => {
      this.summary = json.response
      return json.response
    })

    return ListReportForm({ ...req, paging }).then((res) => {
      const { amounts, supplier_map, paging } = res.response
      const data = getReportForm(amounts, supplier_map)
      const result = { data, paging }
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
