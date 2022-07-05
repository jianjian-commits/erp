import { makeAutoObservable } from 'mobx'
import {
  ListWarehouseTransferSheet,
  Additional,
  ExportWarehouseTransferSheet,
} from 'gm_api/src/inventory'
import type {
  ExportWarehouseTransferSheetRequest,
  Warehouse,
  WarehouseTransferSheet,
  ListWarehouseTransferSheetRequest,
  ListWarehouseTransferSheetResponse,
  StockSheet_SheetStatus,
} from 'gm_api/src/inventory'
import type { PagingParams } from 'gm_api/src/common'
import moment from 'moment'
import _ from 'lodash'
import { getTimestamp } from '@/common/util'
import { TimeType } from '@/pages/sales_invoicing/allocation_inventory/enum'
import { MoreSelectDataItem } from '@gm-pc/react'
import { RECEIPT_STATUS } from '@/pages/sales_invoicing/enum'
import { getInfoByArgs } from '@/pages/sales_invoicing/allocation_inventory/util'
import SaleInvoicStore from '@/pages/sales_invoicing/store'
import type { GroupUser } from 'gm_api/src/enterprise'

type Filter = {
  time_type: number
  begin_time: Date
  end_time: Date
  out_warehouse_id?: string | undefined
  in_warehouse_id?: string | undefined
  sheet_status?: StockSheet_SheetStatus
  printed?: number
  creator_ids?: MoreSelectDataItem[]
  submitter_ids?: MoreSelectDataItem[]
  auditor_ids?: MoreSelectDataItem[]
  q?: string | undefined
}

class Store {
  constructor() {
    makeAutoObservable(this, undefined, { autoBind: true })
  }

  activeType = String(RECEIPT_STATUS.all)

  filter: Filter = {
    time_type: TimeType.TIME_TYPE_CREATE_TIME,
    begin_time: moment().startOf('day').add(-29, 'days').toDate(),
    end_time: moment().endOf('day').toDate(),
    out_warehouse_id: undefined,
    in_warehouse_id: undefined,
    printed: 0,
    creator_ids: [],
    submitter_ids: [],
    auditor_ids: [],
    q: '',
    sheet_status: 0,
  }

  count: string | undefined = '0'
  list: WarehouseTransferSheet[] = []
  paging: PagingParams = {}
  groupUsers: GroupUser[] = []
  warehouses: Warehouse[] = []
  additional: Additional = {}

  getRelationInfo(k: keyof Additional, keyId: string) {
    if (!this.additional) return {}
    const target = this.additional[k]
    return getInfoByArgs(target, keyId)
  }

  get getSearch(): Omit<ListWarehouseTransferSheetRequest, 'paging'> {
    const { end_time, begin_time, creator_ids, submitter_ids, auditor_ids } =
      this.filter
    const creatorIds = _.map(creator_ids, (creator) => {
      return creator.value
    })
    const submitterIds = _.map(submitter_ids, (submitter) => {
      return submitter.value
    })
    const auditorIds = _.map(auditor_ids, (auditor) => {
      return auditor.value
    })
    const params: Omit<ListWarehouseTransferSheetRequest, 'paging'> = {
      ...this.filter,
      begin_time: getTimestamp(begin_time),
      end_time: getTimestamp(end_time),
      creator_ids: creatorIds,
      submitter_ids: submitterIds,
      auditor_ids: auditorIds,
    }

    return params
  }

  async fetchGroupUser() {
    const res = await SaleInvoicStore.fetchGroupUser()
    this.groupUsers = res.response.group_users
  }

  fetchAllocationList(params: { paging: PagingParams }) {
    const req = {
      ...this.getSearch,
      paging: params.paging,
      with_additional: true,
    }
    this.paging = params.paging
    return ListWarehouseTransferSheet(req).then((json) => {
      const { paging, warehouse_transfer_sheets, additional } =
        json.response as ListWarehouseTransferSheetResponse
      if (paging?.count) {
        this.count = json.response.paging?.count
      }
      this.list = warehouse_transfer_sheets
      this.additional = additional

      return json.response
    })
  }

  changeFilter<T extends keyof Filter>(key: T, value: Filter[T]) {
    this.filter[key] = value
  }

  changeActiveType(type: string) {
    this.activeType = type
    this.changeFilter('sheet_status', Number(type))
  }

  handleExport() {
    const req: ExportWarehouseTransferSheetRequest = {
      list_warehouse_transfer_sheet_request: {
        ...this.getSearch,
        paging: this.paging,
      },
    }
    return ExportWarehouseTransferSheet(req)
  }
}

export default new Store()
