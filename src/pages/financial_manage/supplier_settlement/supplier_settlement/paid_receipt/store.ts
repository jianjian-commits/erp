import { getTimestamp } from '@/common/util'

import { PagingResult } from 'gm_api/src/common'

import { makeAutoObservable } from 'mobx'
import moment from 'moment'
import _ from 'lodash'
import {
  AccountType,
  BatchPaySettle,
  BatchSubmitSettleSheet,
  ExportSettleSheet,
  ListSettleSheet,
  SettleSheet_SheetStatus,
  TimeType,
} from 'gm_api/src/finance'

interface Filter {
  begin_time: Date
  end_time: Date
  sheet_status: number
  supplierSelected?: any
  payment_method: number
}

const initFilter: Filter = {
  begin_time: moment().startOf('day').toDate(),
  end_time: moment().endOf('day').toDate(),
  sheet_status: SettleSheet_SheetStatus.SHEET_STATUS_UNSPECIFIED,
  supplierSelected: undefined,
  payment_method: 0,
}

class Store {
  filter: Filter = { ...initFilter }
  list: any[] = []
  paging: PagingResult = { count: 0 }

  activeType = 'all'
  notInQuery: boolean | undefined = false

  listRequest = _.noop

  constructor() {
    makeAutoObservable(this, undefined, { autoBind: true })
  }

  setListRequest(func: any) {
    this.listRequest = func
  }

  changeFilter<T extends keyof Filter>(name: T, value: Filter[T]) {
    this.filter[name] = value
  }

  changeActiveType(sheet_status: any) {
    this.filter.sheet_status = sheet_status
  }

  getSearchData() {
    const {
      begin_time,
      end_time,
      supplierSelected,
      sheet_status,
      payment_method,
    } = this.filter
    return {
      begin_time: getTimestamp(begin_time)!,
      end_time: getTimestamp(end_time)!,
      sheet_status: sheet_status === 0 ? [] : [sheet_status],
      target_id: supplierSelected?.value,
      account_type: AccountType.ACCOUNT_TYPE_SUPPLIER,
      time_type: TimeType.TIME_TYPE_CREATE_TIME,
      credit_type: payment_method,
    }
  }

  fetchList(params: any) {
    const req = { paging: params.paging, ...this.getSearchData() }

    return ListSettleSheet(req).then((json) => {
      const { relation_supplier_info } = json.response
      this.list = _.map(json.response.settle_sheets, (item) => {
        const supplier = relation_supplier_info![item.target_id!]
        return {
          ...item,
          target_delete_time: supplier.delete_time,
          target_customized_code: supplier.customized_code,
          target_name: supplier.name,
        }
      })
      this.paging = json.response.paging
      return json.response
    })
  }

  batchSettle(code: string, selected: string[], isSelectedAll: boolean) {
    const req = isSelectedAll
      ? { ...this.getSearchData(), arrival_serial_no: code }
      : {
          arrival_serial_no: code,
          settle_sheet_ids: selected,
          account_type: AccountType.ACCOUNT_TYPE_SUPPLIER,
        }
    return BatchPaySettle(req)
  }

  batchSubmit(selected: string[], isSelectedAll: boolean) {
    const req = isSelectedAll
      ? { ...this.getSearchData() }
      : {
          settle_sheet_ids: selected,
          account_type: AccountType.ACCOUNT_TYPE_SUPPLIER,
        }
    return BatchSubmitSettleSheet(req)
  }

  export() {
    return ExportSettleSheet({
      ...this.getSearchData(),
    })
  }
}

export default new Store()
