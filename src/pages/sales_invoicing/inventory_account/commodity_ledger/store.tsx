import { makeAutoObservable } from 'mobx'
import moment from 'moment'
import _ from 'lodash'
import { ListStockLog, ExportStockLog } from 'gm_api/src/inventory'
import { ListSkuV2 } from 'gm_api/src/merchandise'
import { StockLog } from 'gm_api/src/inventory/types'
import type { MoreSelectDataItem } from '@gm-pc/react'

import { getLogAdditional } from '@/pages/sales_invoicing/util'
import { EXPORT_TASK_TYPE } from '@/pages/sales_invoicing/enum'
import { TableRequestParams } from '../../interface'

interface FilterType {
  begin_time: Date
  end_time: Date
  q: string
  operate_type: number
  sku_id?: MoreSelectDataItem<string>
  unit_id?: MoreSelectDataItem<string>
  with_additional?: boolean
  show_cancelled: boolean // 显示反审等操作
  warehouse_id?: string
}

const initFilter: FilterType = {
  begin_time: moment().startOf('day').add(-29, 'days').toDate(),
  end_time: moment().endOf('day').toDate(),
  sku_id: undefined,
  unit_id: undefined,
  q: '',
  operate_type: 0,
  with_additional: true,
  show_cancelled: true,
  warehouse_id: undefined,
}

class LedgerStore {
  list: StockLog[] = []

  filter: FilterType = { ...initFilter }

  constructor() {
    makeAutoObservable(this, undefined, { autoBind: true })
  }

  clear() {
    this.filter = { ...initFilter }
  }

  clean() {
    this.filter = { ...initFilter }
    this.list = []
  }

  updateFilter<T extends keyof FilterType>(key: T, value: FilterType[T]) {
    this.filter[key] = value
  }

  getSearchData() {
    const { begin_time, end_time, sku_id, unit_id, warehouse_id, ...other } =
      this.filter
    return {
      begin_time: '' + moment(begin_time).format('x'),
      end_time: '' + moment(end_time).format('x'),
      sku_id: sku_id?.value,
      unit_id: unit_id?.value,
      warehouse_id,
      ...other,
    }
  }

  fetchList = (params: TableRequestParams) => {
    const req = Object.assign({ paging: params.paging }, this.getSearchData())
    return ListStockLog(req).then((json) => {
      const { additional, stock_logs } = json.response
      this.list = getLogAdditional({
        data: stock_logs!,
        additional: additional!,
        showUser: true,
      })
      return json.response
    })
  }

  export() {
    return ExportStockLog({
      list_stock_log_request: Object.assign(this.getSearchData(), {
        paging: {
          limit: 0,
        },
      }),
      task_type: EXPORT_TASK_TYPE.change,
    })
  }

  fetchSkuList(q: string) {
    return ListSkuV2({
      filter_params: { q, sku_types: [1, 2] },
      paging: { limit: 999 },
      request_data: 1024 + 256,
    })
  }
}

export default new LedgerStore()
export type { FilterType }
