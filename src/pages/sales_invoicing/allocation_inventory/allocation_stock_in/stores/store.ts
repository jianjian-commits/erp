import { makeAutoObservable } from 'mobx'
import moment from 'moment'
import _ from 'lodash'
import { MoreSelectDataItem } from '@gm-pc/react'
import { getTimestamp } from '@/common/util'
import {
  Additional,
  TimeType,
  ListStockSheet,
  StockSheet,
  ExportStockSheet,
  StockSheet_SheetType,
  StockSheet_SheetStatus,
} from 'gm_api/src/inventory'
import { RECEIPT_STATUS } from '@/pages/sales_invoicing/enum'
import {
  TableRequestParams,
  ReceiptStatusAllKey,
} from '@/pages/sales_invoicing/interface'
import { getInfoByArgs } from '@/pages/sales_invoicing/allocation_inventory/util'
import { PagingParams } from 'gm_api/src/common'

interface FilterType {
  time_type: number
  begin_time: Date
  end_time: Date
  creator_ids: MoreSelectDataItem[]
  warehouse_id: string
  in_warehouse_id: number
  out_warehouse_id: number
  q: string
  stock_sheet_type: number
  stock_sheet_status: number
  with_additional: boolean
}

class Store {
  constructor() {
    makeAutoObservable(this, undefined, { autoBind: true })
  }

  activeType = 'all'

  filter: FilterType = {
    time_type: TimeType.TIME_TYPE_CREATE,
    begin_time: moment().startOf('day').add(-29, 'days').toDate(),
    end_time: moment().endOf('day').toDate(),
    creator_ids: [],
    warehouse_id: '',
    in_warehouse_id: 0,
    out_warehouse_id: 0,
    q: '',
    stock_sheet_type: StockSheet_SheetType.SHEET_TYPE_WAREHOUSE_IN,
    stock_sheet_status: StockSheet_SheetStatus.SHEET_STATUS_UNSPECIFIED,
    with_additional: true,
  }

  list: StockSheet[] = []
  count = '0'
  paging = { limit: 0 }
  groupUsers = {}
  additional: Additional = {}

  getSearchParams(paging: PagingParams = this.paging) {
    const { creator_ids, begin_time, end_time } = this.filter
    const creatorIds = creator_ids.map((creator) => creator.value)
    return {
      ..._.omit(this.filter, ['in_warehouse_id', 'out_warehouse_id']),
      creator_ids: creatorIds,
      begin_time: getTimestamp(begin_time),
      end_time: getTimestamp(end_time),
      paging,
    }
  }

  fetchList(params: TableRequestParams) {
    const req = this.getSearchParams(params.paging as PagingParams)

    return ListStockSheet(req).then((json) => {
      const { paging, stock_sheets, additional } = json.response
      if (paging?.count) {
        this.count = paging?.count
      }
      this.list = stock_sheets
      this.additional = additional as Additional

      return json.response
    })
  }

  getRelationInfo(k: keyof Additional, keyId: string) {
    if (!this.additional) return {}
    const target = this.additional[k]
    return getInfoByArgs(target, keyId)
  }

  changeFilter<T extends keyof FilterType>(key: T, value: FilterType[T]) {
    this.filter[key] = value
  }

  changeActiveType(type: ReceiptStatusAllKey) {
    this.activeType = type
    this.changeFilter('stock_sheet_status', RECEIPT_STATUS[type])
  }

  // 导出
  handleExport() {
    return ExportStockSheet({
      list_stock_sheet_request: this.getSearchParams(),
    })
  }
}

export default new Store()
