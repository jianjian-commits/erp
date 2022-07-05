import { makeAutoObservable } from 'mobx'
import moment from 'moment'
import {
  ListStockSheet,
  DeleteStockSheet,
  ExportStockSheet,
  BatchUpdateStockSheet,
} from 'gm_api/src/inventory'
import { StockSheet } from 'gm_api/src/inventory/types'
import { PagingResult } from 'gm_api/src/common'
import _ from 'lodash'
import { getTimestamp } from '@/common/util'
import {
  ReceiptStatusKey,
  TableRequestParams,
} from '@/pages/sales_invoicing/interface'
import { RECEIPT_STATUS, RECEIPT_TYPE } from '@/pages/sales_invoicing/enum'
import { GroupUser } from 'gm_api/src/enterprise'
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
  with_additional: boolean
  without_details: boolean
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
    stock_sheet_type: RECEIPT_TYPE.otherIn,
    stock_sheet_status: 0,
    is_printed: 0,
    creator_ids: undefined,
    with_additional: true,
    without_details: true,
    warehouse_id: undefined,
  }

  paging: PagingResult = { count: 0 }
  notInQuery: boolean | undefined = false

  changeFilter = <T extends keyof FilterType>(key: T, value: FilterType[T]) => {
    this.filter[key] = value
  }

  changeTab = (value: string) => {
    this.active_tab = value
  }

  constructor() {
    makeAutoObservable(this, undefined, { autoBind: true })
  }

  getSearchData() {
    const { begin_time, end_time, creator_ids, warehouse_id, ...other } =
      this.filter

    const creatorIds = _.map(creator_ids, (creator) => {
      return creator.value
    })

    return {
      begin_time: '' + moment(begin_time).format('x'),
      end_time: '' + moment(end_time).format('x'),
      creator_ids: creatorIds,
      warehouse_id,
      ...other,
    }
  }

  fetchList = (params: TableRequestParams) => {
    const req = Object.assign({ paging: params.paging }, this.getSearchData())

    return ListStockSheet(req).then((json) => {
      const { additional } = json.response
      this.groupUsers = additional?.group_users
      this.list = _.map(json.response.stock_sheets, (item) => {
        return Object.assign(item, {
          warehouse_name:
            (item.warehouse_id &&
              additional?.warehouses?.[item.warehouse_id]?.name) ||
            '',
        })
      })!
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

  getBatchReq(selected: string[], isSelectAll: boolean): any {
    const req = {
      stock_sheet_type: this.filter.stock_sheet_type,
    }
    if (isSelectAll) {
      const { begin_time, end_time, ...other } = this.filter
      Object.assign(req, {
        list_stock_sheet_request: {
          ...other,
          begin_time: getTimestamp(begin_time),
          end_time: getTimestamp(end_time),
        },
      })
    } else {
      Object.assign(req, { stock_sheet_ids: selected })
    }

    return req
  }

  // 批量提交
  batchUpdateReceipt(
    selected: string[],
    isSelectAll: boolean,
    receiptAction: ReceiptStatusKey,
  ) {
    const req = this.getBatchReq(selected, isSelectAll)
    req.target_status = RECEIPT_STATUS[receiptAction]
    return BatchUpdateStockSheet(req).then((json) => {
      return json
    })
  }
}

export default new Store()
export type { FilterType }
