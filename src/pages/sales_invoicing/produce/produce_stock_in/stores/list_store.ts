import { makeAutoObservable } from 'mobx'
import {
  ListStockSheetRequest,
  StockSheet,
  ListStockSheet,
  DeleteStockSheet,
  ExportStockSheet,
  BatchUpdateStockSheet,
} from 'gm_api/src/inventory'
import moment from 'moment'

import _ from 'lodash'
import { ReceiptStatusKey, TableRequestParams } from '../../../interface'
import { RECEIPT_STATUS, RECEIPT_TYPE } from '../../../enum'
import { getTimestamp } from '@/common/util'
import { PagingResult } from 'gm_api/src/common'
import { GroupUser } from 'gm_api/src/enterprise'
import { Tip } from '@gm-pc/react'
import { t } from 'gm-i18n'

interface Filter
  extends Omit<
    ListStockSheetRequest,
    'paging' | 'begin_time' | 'end_time' | 'time_type'
  > {
  begin_time: Date
  end_time: Date
  time_type: number
  supplierSelected?: any
  creator_ids?: any
  with_additional: boolean
  without_details: boolean
  warehouse_id?: string
}

const initFilter: Filter = {
  stock_sheet_type: RECEIPT_TYPE.productIn,
  time_type: 1,
  begin_time: moment().startOf('day').add(-29, 'days').toDate(),
  end_time: moment().endOf('day').toDate(),
  q: '',
  supplierSelected: [],
  is_printed: 0,
  stock_sheet_status: 0,
  creator_ids: undefined,
  with_additional: true,
  without_details: true,
  warehouse_id: undefined,
}
class Store {
  filter: Filter = { ...initFilter }
  list: Array<StockSheet> = []
  supplierList = []

  paging: PagingResult = { count: 0 }

  activeType = 'all'
  notInQuery: boolean | undefined = false
  groupUsers: { [key: string]: GroupUser } | undefined = {}

  constructor() {
    makeAutoObservable(this, undefined, { autoBind: true })
  }

  changeFilter<T extends keyof Filter>(name: T, value: Filter[T]) {
    this.filter[name] = value
  }

  changeActiveType(type: string) {
    this.activeType = type
  }

  getSearchData() {
    const { begin_time, end_time, creator_ids, warehouse_id, ...rest } =
      this.filter

    const creatorIds = _.map(creator_ids, (creator) => {
      return creator.value
    })

    return {
      begin_time: getTimestamp(begin_time),
      end_time: getTimestamp(end_time),
      creator_ids: creatorIds,
      warehouse_id: warehouse_id,
      ...rest,
    }
  }

  fetchList(params: TableRequestParams) {
    const req: any = Object.assign(
      { paging: params.paging },
      this.getSearchData(),
    )

    return ListStockSheet(req).then((json) => {
      const { additional } = json.response
      this.groupUsers = additional?.group_users
      this.list =
        _.map(json.response.stock_sheets, (item) => {
          return Object.assign(item, {
            warehouse_name:
              (item.warehouse_id &&
                additional?.warehouses?.[item.warehouse_id]?.name) ||
              '', // 仓库名
          })
        }) || []
      this.notInQuery = json.response.find_out_filter

      this.paging = json.response.paging

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
