import { makeAutoObservable } from 'mobx'
import {
  ListStockSheet,
  DeleteStockSheet,
  ExportStockSheet,
} from 'gm_api/src/inventory'
import { StockSheet, StockSheet_SheetType } from 'gm_api/src/inventory/types'
import { ComShelf, TableRequestParams } from '@/pages/sales_invoicing/interface'
import { PagingResult } from 'gm_api/src/common'

import moment from 'moment'
import { GroupUser } from 'gm_api/src/enterprise'
import _ from 'lodash'
import { Tip } from '@gm-pc/react'
import { t } from 'gm-i18n'

interface FilterType {
  begin_time: Date
  end_time: Date
  time_type: number
  q: string
  stock_sheet_type: number
  stock_sheet_status: number
  is_printed: number
  creator_ids?: any
  with_additional: true
  warehouse_id?: string
}

class Store {
  list: StockSheet[] = []
  groupUsers: { [key: string]: GroupUser } | undefined = {}

  active_tab = 'all'

  filter: FilterType = {
    begin_time: moment().startOf('day').add(-29, 'days').toDate(),
    end_time: moment().endOf('day').toDate(),
    time_type: 1,
    q: '',
    stock_sheet_type: StockSheet_SheetType.SHEET_TYPE_TRANSFER,
    stock_sheet_status: 0,
    is_printed: 0,
    creator_ids: undefined,
    with_additional: true,
    warehouse_id: undefined,
  }

  paging: PagingResult = { count: 0 }

  shelfList: ComShelf[] = [] // 货位

  // shelf_selected = []

  notInQuery: boolean | undefined = false

  changeFilter = <T extends keyof FilterType>(key: T, value: FilterType[T]) => {
    this.filter[key] = value
  }

  changeTab = (value: string) => {
    this.active_tab = value
  }

  allShelfResponse: any
  supplierList: any

  constructor() {
    makeAutoObservable(this, undefined, { autoBind: true })
  }

  getSearchData() {
    const { begin_time, end_time, creator_ids, ...other } = this.filter

    const creatorIds = _.map(creator_ids, (creator) => {
      return creator.value
    })

    return {
      begin_time: '' + moment(begin_time).format('x'),
      end_time: '' + moment(end_time).format('x'),
      creator_ids: creatorIds,
      ...other,
    }
  }

  fetchList = (params: TableRequestParams) => {
    const req = Object.assign({ paging: params.paging }, this.getSearchData())

    return ListStockSheet(req).then((json) => {
      const { additional } = json.response
      this.groupUsers = additional?.group_users
      this.list = json.response.stock_sheets!
      this.paging = json.response.paging!
      this.notInQuery = json.response.find_out_filter
      return json.response
    })
  }

  deleteReceipt(index: number) {
    return DeleteStockSheet({
      stock_sheet_id: this.list[index].stock_sheet_id,
    }).then(() => Tip.success(t('删除单据成功')))
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
export type { FilterType }
