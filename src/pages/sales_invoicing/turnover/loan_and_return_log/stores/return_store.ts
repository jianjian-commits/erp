import { makeAutoObservable } from 'mobx'
import moment from 'moment'
import _ from 'lodash'
import {
  UpdateStockSheet,
  ListStockSheet,
  CreateStockSheet,
  UpdateStockSheetRequest,
  BatchUpdateStockSheet,
  ExportStockSheet,
  DeleteStockSheet,
} from 'gm_api/src/inventory'
import globalStore from '@/stores/global'

import { RECEIPT_TYPE, RECEIPT_STATUS } from '@/pages/sales_invoicing/enum'
import {
  TableRequestParams,
  CustomerSheetType,
} from '@/pages/sales_invoicing/interface'
import { FtSheet, StockSheetInfo, StatusType } from '../../interface'
import {
  getSheetAdditional,
  getSearchCustomer,
} from '@/pages/sales_invoicing/util'
import { Tip } from '@gm-pc/react'
import { t } from 'gm-i18n'

const initFilter: FtSheet = {
  begin_time: moment().startOf('day').add(-29, 'days').toDate(),
  end_time: moment().endOf('day').toDate(),
  time_type: 1,
  select_type: 0,
  customer_q: '',
  sku_q: '',
  stock_sheet_type: RECEIPT_TYPE.turnoverRevert,
  stock_sheet_status: 0,
  with_additional: true,
  warehouse_id: undefined,
}

const initSheetType: CustomerSheetType = {
  customer: undefined,
  sku: undefined,
  quantity: null,
  group_user_id: '0',
  base_unit_name: '-',
  warehouse_id: undefined,
}

class Store {
  filter: FtSheet = { ...initFilter }
  sheetInfo: CustomerSheetType = { ...initSheetType }
  list: StockSheetInfo[] = []

  constructor() {
    makeAutoObservable(this, undefined, { autoBind: true })
  }

  changeFilter<T extends keyof FtSheet>(name: T, value: FtSheet[T]) {
    this.filter[name] = value
  }

  createSheetInfo<T extends keyof CustomerSheetType>(
    name: T,
    value: CustomerSheetType[T],
  ) {
    this.sheetInfo[name] = value
    // 改变base_unit_name
    if (name === 'sku') {
      this.sheetInfo.base_unit_name =
        globalStore.getUnitName(this.sheetInfo.sku?.original.base_unit_id) ||
        '-'
    }
  }

  updateReturnSheet(list: CustomerSheetType) {
    this.sheetInfo = list
  }

  updateSheetInfo<T extends keyof StockSheetInfo>(
    index: number,
    key: T,
    value: StockSheetInfo[T],
  ) {
    this.list[index][key] = value
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

  clearSheet() {
    this.sheetInfo = { ...initSheetType }
  }

  getSearchData() {
    const { begin_time, end_time, select_type, ...other } = this.filter
    const omitResult = _.omit(other, [
      select_type === 1 ? 'customer_q' : 'sku_q',
    ])
    return {
      begin_time: moment(begin_time).format('x'),
      end_time: '' + moment(end_time).format('x'),
      ...omitResult,
    }
  }

  fetchList(params: TableRequestParams) {
    const req: any = Object.assign(
      { paging: params.paging },
      this.getSearchData(),
    )
    return ListStockSheet(req).then((json) => {
      const { stock_sheets, additional } = json.response
      this.list = getSheetAdditional(stock_sheets, additional!)
      return json.response
    })
  }

  createSheet() {
    return CreateStockSheet(getSearchCustomer(this.sheetInfo, 'turnoverRevert'))
  }

  updateSheet(index: number, status?: StatusType) {
    if (status === 'deleted') {
      return DeleteStockSheet({
        stock_sheet_id: this.list[index].stock_sheet_id,
      }).then(() => Tip.success(t('删除单据成功')))
    }
    const {
      edit,
      skuInfo,
      customerInfo,
      base_unit_name,
      groupUserInfo,
      quantity,
      old_sheet_status,
      ...other
    } = this.list[index]
    const input_stock = other.details![0].input_stock
    const req: UpdateStockSheetRequest = {
      stock_sheet_id: other.stock_sheet_id,
      stock_sheet: other,
    }
    input_stock.input!.quantity = quantity!.toString()
    input_stock.input2!.quantity = quantity!.toString()
    return UpdateStockSheet(req)
  }

  getSearchBatchData(status: StatusType) {
    return {
      stock_sheet_type: RECEIPT_TYPE.turnoverRevert,
      target_status: RECEIPT_STATUS[status],
    }
  }

  batchUpdateStock(
    selected: string[],
    isSelectAll: boolean,
    status: StatusType,
  ) {
    const req = Object.assign(
      this.getSearchBatchData(status),
      isSelectAll
        ? { list_stock_sheet_request: this.getSearchData() }
        : { stock_sheet_ids: selected },
    )
    return BatchUpdateStockSheet(req).then((json) => {
      return json
    })
  }

  doRequest = () => {}

  setDoRequest(func: () => void) {
    this.doRequest = func
  }
}

export default new Store()
