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
  target_id: '0',
  operate_type: OPERATE_TYPE.transferIn, // 采购入库
  with_additional: true,
  stock_id: 0,
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
      task_type: EXPORT_TASK_TYPE.transferIn,
    })
  }

  constructor() {
    makeAutoObservable(this, undefined, { autoBind: true })
  }

  getSearchData() {
    const { begin_time, end_time, supplier_id, ...another } = this.filter

    return {
      begin_time: '' + moment(begin_time).format('x'),
      end_time: '' + moment(end_time).format('x'),
      supplier_ids: supplier_id && supplier_id !== '0' ? [supplier_id] : [],
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
      })
      return json.response
    })
  }
}

export default new Store()
