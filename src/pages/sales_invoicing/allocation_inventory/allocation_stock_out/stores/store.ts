import { makeAutoObservable } from 'mobx'
import moment from 'moment'
import {
  ListStockSheet,
  ListStockSheetRequest,
  StockSheet,
  StockSheet_SheetStatus,
  TimeType,
  ExportStockSheet,
  Warehouse,
} from 'gm_api/src/inventory'
import { RECEIPT_TYPE } from '@/pages/sales_invoicing/enum'
import { Filters_Bool, PagingResult } from 'gm_api/src/common'
import _ from 'lodash'
import { TableRequestParams } from '@/pages/sales_invoicing/interface'
import { GroupUser } from 'gm_api/src/enterprise'

interface Filter
  extends Omit<
    ListStockSheetRequest,
    'paging' | 'begin_time' | 'end_time' | 'time_type'
  > {
  begin_time: Date
  end_time: Date
  time_type: number
  customer_label_selected?: any
  customer_label_ids?: any
  creator_ids?: any
}

const initFilter: Filter = {
  stock_sheet_type: RECEIPT_TYPE.warehouseOut,
  time_type: TimeType.TIME_TYPE_CREATE, // 时间的搜索类型，两种 建单时间 1、出库时间
  begin_time: moment().startOf('day').add(-29, 'days').toDate(),
  end_time: moment().endOf('day').toDate(),
  q: '', // 单号
  is_printed: Filters_Bool.ALL,
  stock_sheet_status: StockSheet_SheetStatus.SHEET_STATUS_UNSPECIFIED,
  creator_ids: undefined, // 建单人
  warehouse_id: undefined, // 仓库id
}

class Store {
  constructor() {
    makeAutoObservable(this, undefined, { autoBind: true })
  }

  activeType = 'all'

  filter: Filter = { ...initFilter }

  list: StockSheet[] = []
  warehouseList: Record<'value' | 'text', string>[] = []
  paging: PagingResult = { count: '0' }
  groupUsers: Record<string, GroupUser> | undefined = {}
  warehouses: Record<string, Warehouse> | undefined = {}

  changeFilter<T extends keyof Filter>(name: T, value: Filter[T]) {
    this.filter[name] = value
  }

  getSearchData() {
    const { begin_time, end_time, creator_ids, ...rest } = this.filter

    const creatorIds = _.map(creator_ids, (creator) => {
      return creator.value
    })

    return {
      ...rest,
      begin_time: `${+begin_time}`,
      end_time: `${+end_time}`,
      creator_ids: creatorIds,
    }
  }

  fetchList(params: TableRequestParams) {
    const req: any = Object.assign(
      { paging: params.paging, with_additional: true, without_details: true },
      this.getSearchData(),
    )

    return ListStockSheet(req).then((json) => {
      this.list = json.response.stock_sheets
      this.groupUsers = json.response.additional?.group_users
      this.paging = json.response.paging
      this.warehouses = json.response.additional?.warehouses

      return json.response
    })
  }

  changeActiveType(type: string) {
    this.activeType = type
  }

  export() {
    return ExportStockSheet({
      list_stock_sheet_request: Object.assign(this.getSearchData(), {
        paging: {
          limit: 0,
        },
      }),
    })
  }
}

export default new Store()
