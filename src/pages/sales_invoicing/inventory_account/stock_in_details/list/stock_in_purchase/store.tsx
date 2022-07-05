import { makeAutoObservable } from 'mobx'
import moment from 'moment'
import { ListStockLog, ExportStockLog } from 'gm_api/src/inventory'
import { StockLog } from 'gm_api/src/inventory/types'

import { getLogAdditional } from '@/pages/sales_invoicing/util'
import { StatisticalType } from '@/pages/sales_invoicing/interface'
import { OPERATE_TYPE, EXPORT_TASK_TYPE } from '@/pages/sales_invoicing/enum'
import { FilterType, TableRequestParams } from '../../types'

const initFilter: FilterType = {
  begin_time: moment().startOf('day').add(-29, 'days').toDate(),
  end_time: moment().endOf('day').toDate(),
  q: '',
  supplier_id: '',
  operate_type: OPERATE_TYPE.purchaseIn, // 采购入库
  with_additional: true,
  purchaser_id: '',
  warehouse_id: undefined,
}

class Store {
  filter: FilterType = { ...initFilter }

  list: StockLog[] = []
  listStatistical: StatisticalType = {
    goodsItems: 0,
    stockMoney: 0,
    stockNumbers: 0,
    stockAverage: 0,
  }

  _handleUpdateFilter = <T extends keyof FilterType>(
    key: T,
    value: FilterType[T],
  ) => {
    this.filter[key] = value
  }

  _handleExport = () => {
    return ExportStockLog({
      list_stock_log_request: Object.assign(this.getSearchData(), {
        paging: {
          limit: 0,
        },
      }),
      task_type: EXPORT_TASK_TYPE.purchaseIn,
    })
  }

  constructor() {
    makeAutoObservable(this, undefined, { autoBind: true })
  }

  getSearchData() {
    const {
      begin_time,
      end_time,
      // category_ids,
      purchaser_id,
      supplier_id,
      warehouse_id,
      ...another
    } = this.filter

    return {
      begin_time: '' + moment(begin_time).format('x'),
      end_time: '' + moment(end_time).format('x'),
      purchaser_ids: purchaser_id ? [purchaser_id] : undefined,
      supplier_ids: supplier_id ? [supplier_id] : undefined,
      warehouse_id,
      ...another,
    }
  }

  fetchList = (params: TableRequestParams) => {
    const req = Object.assign({ paging: params.paging }, this.getSearchData())
    return ListStockLog(req).then((json) => {
      const { additional, stock_logs } = json.response
      this.list = getLogAdditional({
        data: stock_logs!,
        additional: additional!,
        showSuppliers: true,
        showPurchasers: true,
      })
      return json.response
    })
  }
}

export default new Store()
