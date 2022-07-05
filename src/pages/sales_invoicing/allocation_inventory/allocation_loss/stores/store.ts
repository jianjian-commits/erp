import { makeAutoObservable } from 'mobx'
import {
  Additional,
  ExportWarehouseTransferSheetDetail,
  ListWarehouseTransferSheetDetail,
  TimeType,
  Warehouse,
  WarehouseTransferSheetDetail,
} from 'gm_api/src/inventory'
import moment from 'moment'
import { PagingResult } from 'gm_api/src/common'
import { TableRequestParams } from '@/pages/sales_invoicing/interface'
import { GroupUser } from 'gm_api/src/enterprise'

type Filter = {
  time_type: number
  begin_time: Date
  end_time: Date
  is_finished: boolean
  is_loss: boolean
  out_warehouse_id?: string
  in_warehouse_id?: string
  warehouse_transfer_sheet_serial_no?: string
  with_additional?: boolean
}

const initFilter: Filter = {
  time_type: TimeType.TIME_TYPE_CREATE,
  begin_time: moment().startOf('day').add(-29, 'days').toDate(),
  end_time: moment().endOf('day').toDate(),
  is_finished: true,
  is_loss: true,
  with_additional: true,
  out_warehouse_id: undefined,
  in_warehouse_id: undefined,
  warehouse_transfer_sheet_serial_no: undefined,
}

class Store {
  constructor() {
    makeAutoObservable(this, undefined, { autoBind: true })
  }

  filter = { ...initFilter }

  list: WarehouseTransferSheetDetail[] = []

  paging: PagingResult = { count: '0' }

  groupUsers: Record<string, GroupUser> | undefined = {}

  warehouses: Record<string, Warehouse> | undefined = {}

  additional: Additional | undefined = {}

  fetchList(params: TableRequestParams) {
    const req: any = {
      paging: params.paging,
      ...this.getSearchData(),
    }

    return ListWarehouseTransferSheetDetail(req).then((json) => {
      if (json.response.paging?.count) {
        this.paging = json.response.paging
      }
      this.list = json.response.warehouse_transfer_sheet_details
      this.groupUsers = json.response.additional?.group_users
      this.warehouses = json.response.additional?.warehouses
      this.additional = json.response.additional
      return json.response
    })
  }

  changeFilter<T extends keyof Filter>(key: T, value: Filter[T]) {
    this.filter[key] = value
  }

  handleExport() {
    return ExportWarehouseTransferSheetDetail({
      list_warehouse_transfer_sheet_detail_request: Object.assign(
        this.getSearchData(),
        {
          paging: {
            limit: 0,
          },
        },
      ),
    })
  }

  getSearchData() {
    const { begin_time, end_time, ...rest } = this.filter
    return {
      ...rest,
      begin_time: `${+begin_time}`,
      end_time: `${+end_time}`,
    }
  }
}

export default new Store()
