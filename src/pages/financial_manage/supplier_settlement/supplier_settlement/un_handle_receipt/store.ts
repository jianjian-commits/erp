import { getTimestamp } from '@/common/util'
import { RECEIPT_TYPE } from '@/pages/sales_invoicing/enum'
import { Tip } from '@gm-pc/react'
import { PagingResult } from 'gm_api/src/common'

import {
  ExportStockSheet,
  ListStockSheet,
  StockSheet_PayStatus,
  StockSheet_SheetStatus,
} from 'gm_api/src/inventory'
import { makeAutoObservable } from 'mobx'
import moment from 'moment'
import _ from 'lodash'
import {
  AccountType,
  CreateSettleSheet,
  CreateSettleSheetRequest_OperateType,
  ListSettleSheet,
  SettleSheet,
  SettleSheet_SheetStatus,
  Status_Code,
  TimeType,
} from 'gm_api/src/finance'
import { t } from 'gm-i18n'

interface Filter {
  begin_time: Date
  end_time: Date
  time_type: number
  stock_sheet_type: number
  supplierSelected?: any
  warehouse_id?: string
}

const initFilter: Filter = {
  time_type: 1,
  begin_time: moment().startOf('day').toDate(),
  end_time: moment().endOf('day').toDate(),
  stock_sheet_type: 0,
  supplierSelected: undefined,
  warehouse_id: '0',
}

class Store {
  filter: Filter = { ...initFilter }
  list: any[] = []
  paging: PagingResult = { count: 0 }

  activeType = 'all'

  paymentSlipList: SettleSheet[] = []

  waitJoinIds: string[] = [] // 全部页时的全部待结款单据

  constructor() {
    makeAutoObservable(this, undefined, { autoBind: true })
  }

  changeFilter<T extends keyof Filter>(name: T, value: Filter[T]) {
    this.filter[name] = value
  }

  getSearchData() {
    const {
      time_type,
      begin_time,
      end_time,
      stock_sheet_type,
      supplierSelected,
    } = this.filter

    const result = {
      time_type,
      begin_time: getTimestamp(begin_time),
      end_time: getTimestamp(end_time),
      target_id: supplierSelected ? supplierSelected.value : undefined,
      pay_status: [StockSheet_PayStatus.PAY_STATUS_NOT_PAID],
      stock_sheet_status: StockSheet_SheetStatus.SHEET_STATUS_APPROVED,
      is_settle_sheet_request: true,
    }

    // 选择全部类型
    if (stock_sheet_type === 0) {
      Object.assign(result, {
        stock_sheet_types: [
          RECEIPT_TYPE.purchaseIn,
          RECEIPT_TYPE.purchaseRefundOut,
        ],
      })
    } else {
      Object.assign(result, { stock_sheet_type: stock_sheet_type })
    }

    return result
  }

  fetchList(params: any) {
    const req = {
      paging: params.paging,
      with_additional: true,
      ...this.getSearchData(),
    }

    return ListStockSheet(req).then((json) => {
      this.list = _.map(json.response.stock_sheets, (item) => {
        const supplier =
          json.response.additional?.suppliers?.[item?.supplier_id!]
        return {
          ...item,
          target_delete_time: supplier?.delete_time || '-',
          target_name: supplier?.name || '-',
          target_customized_code: supplier?.customized_code || '-',
        }
      })
      this.paging = json.response.paging
      return json.response
    })
  }

  batchAddPaid(selected: string[], isSelectAll: boolean) {
    const req: any = {}
    if (isSelectAll) {
      Object.assign(req, this.getSearchData())
    } else {
      Object.assign(req, { ids: selected })
    }
  }

  getAlreadyExistPaymentSlip(isSelectAll: boolean, supplier_id?: string) {
    const req = {
      paging: { limit: 999 },
      account_type: AccountType.ACCOUNT_TYPE_SUPPLIER,
      begin_time: getTimestamp(
        moment().startOf('day').add(-29, 'days').toDate(),
      )!, // 搜索30天内有无已存在的结款单据
      end_time: getTimestamp(moment().endOf('day').toDate())!,
      time_type: TimeType.TIME_TYPE_CREATE_TIME,
      sheet_status: [
        SettleSheet_SheetStatus.SHEET_STATUS_NOT_APPROVED,
        SettleSheet_SheetStatus.SHEET_STATUS_NOT_SUBMITTED,
      ],
    }
    if (isSelectAll) {
      Object.assign(req, {
        stock_sheet_list_query: {
          time_type: this.filter.time_type,
          begin_time: getTimestamp(this.filter.begin_time),
          end_time: getTimestamp(this.filter.end_time),
          pay_status: StockSheet_PayStatus.PAY_STATUS_NOT_PAID,
          stock_sheet_status: StockSheet_SheetStatus.SHEET_STATUS_APPROVED,
          target_id: supplier_id,
        },
      })
    } else {
      Object.assign(req, {
        target_id: supplier_id,
      })
    }

    return ListSettleSheet(req, [Status_Code.CODE_DIFFERENT_SUBJECT]).then(
      (json) => {
        if (json.code === Status_Code.CODE_DIFFERENT_SUBJECT) {
          Tip.danger(t('只有相同的供应商单据才能加入结款单'))
          throw Promise.reject(
            new Error(t('只有相同的供应商单据才能加入结款单')),
          )
        } else {
          this.paymentSlipList = json.response.settle_sheets
          this.waitJoinIds = json.response.wait_join_item_ids
        }

        return json
      },
    )
  }

  postAddInExistPaymentSlip(
    isSelectAll: boolean,
    settleSelectedId: string,
    selected?: string[],
  ) {
    const req = {
      operate_type:
        CreateSettleSheetRequest_OperateType.OPERATE_TYPE_JOIN_SHEET,
      account_type: AccountType.ACCOUNT_TYPE_SUPPLIER,
      join_settle_sheet: _.filter(
        this.paymentSlipList,
        (item) => item.settle_sheet_id === settleSelectedId,
      )[0],
    }
    if (isSelectAll) {
      Object.assign(req, {
        stock_sheet_list_query: {
          ...this.getSearchData(),
        },
      })
    } else {
      Object.assign(req, { item_ids: selected })
    }
    return CreateSettleSheet(req).then((json) => {
      Tip.success(t('加入结款单据成功'))
      return json
    })
  }

  createSettleSheet(isSelectAll: boolean, stock_sheet_ids?: string[]) {
    const req = {
      operate_type:
        CreateSettleSheetRequest_OperateType.OPERATE_TYPE_CREATE_SHEET,
      account_type: AccountType.ACCOUNT_TYPE_SUPPLIER,
    }
    if (isSelectAll) {
      Object.assign(req, {
        stock_sheet_list_query: { ...this.getSearchData() },
      })
    } else {
      Object.assign(req, { item_ids: stock_sheet_ids })
    }
    return CreateSettleSheet(req).then((json) => {
      Tip.success(t('新建结款单据成功'))
      return json
    })
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
