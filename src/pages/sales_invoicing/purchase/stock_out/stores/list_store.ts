import { makeAutoObservable } from 'mobx'
import {
  ListStockSheetRequest,
  StockSheet,
  ListStockSheet,
  DeleteStockSheet,
  ExportStockSheet,
  StockSheet_SheetStatus,
  StockSheet_PayStatus,
  BatchUpdateStockSheet,
} from 'gm_api/src/inventory'
import moment from 'moment'

import _ from 'lodash'
import { ReceiptStatusKey, TableRequestParams } from '../../../interface'
import { RECEIPT_STATUS, RECEIPT_TYPE } from '../../../enum'
import { Filters_Bool, PagingResult } from 'gm_api/src/common'
import {
  CustomerLabel,
  ListCustomerLabel,
  GroupUser,
} from 'gm_api/src/enterprise'
import { adapterMoreSelectComData, getTimestamp } from '@/common/util'
import { ListDataItem, Tip } from '@gm-pc/react'
import { handlePayStatus } from '@/pages/sales_invoicing/util'
import { t } from 'gm-i18n'

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
  warehouse_id?: string
}

const initFilter: Filter = {
  stock_sheet_type: RECEIPT_TYPE.purchaseRefundOut,
  time_type: 1,
  begin_time: moment().startOf('day').add(-29, 'days').toDate(),
  end_time: moment().endOf('day').toDate(),
  q: '',
  is_printed: Filters_Bool.ALL,
  customer_label_selected: [],
  customer_label_ids: [],
  stock_sheet_status: StockSheet_SheetStatus.SHEET_STATUS_UNSPECIFIED,
  pay_status: StockSheet_PayStatus.PAY_STATUS_UNSPECIFIED,
  creator_ids: undefined,
  warehouse_id: undefined,
}
class Store {
  filter: Filter = { ...initFilter }
  list: Array<StockSheet> = []
  customerLabelList: (CustomerLabel & ListDataItem<string>)[] = []

  groupUsers: { [key: string]: GroupUser } | undefined = {}
  paging: PagingResult = { count: 0 }

  activeType = 'all'
  notInQuery: boolean | undefined = false

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
    const {
      begin_time,
      end_time,
      customer_label_ids,
      customer_label_selected,
      pay_status,
      creator_ids,
      target_id,
      warehouse_id,
      ...rest
    } = this.filter
    console.log(this.filter, 'filter')

    const creatorIds = _.map(creator_ids, (creator) => {
      return creator.value
    })

    return {
      ...rest,
      begin_time: `${+begin_time}`,
      end_time: `${+end_time}`,
      customer_label_ids: _.map(
        customer_label_selected,
        (item) => item.customer_label_id,
      ),
      supplier_ids: target_id !== '0' ? [target_id] : [],
      creator_ids: creatorIds,
      pay_status: handlePayStatus(pay_status!).value,
      warehouse_id: warehouse_id,
    }
  }

  fetchList(params: TableRequestParams) {
    const req: any = Object.assign(
      { paging: params.paging, with_additional: true, without_details: true },
      this.getSearchData(),
    )

    console.log(req, 'req')

    return ListStockSheet(req).then((json) => {
      const { additional } = json.response
      this.list = _.map(json.response.stock_sheets, (item) => {
        const supplier = additional?.suppliers?.[item?.supplier_id!]
        const warehouse = additional?.warehouses?.[item?.warehouse_id!]
        return {
          ...item,
          target_name: item?.supplier_id ? supplier?.name : item?.target_name,
          target_delete_time: item?.supplier_id ? supplier?.delete_time : '0',
          target_customized_code: item?.supplier_id
            ? supplier?.customized_code
            : '',
          warehouse_name: (item.warehouse_id && warehouse?.name) || '', // 仓库名
        }
      })

      this.groupUsers = json.response.additional?.group_users
      this.paging = json.response.paging

      this.notInQuery = json.response.find_out_filter

      return json.response
    })
  }

  fetchCustomerLabelList() {
    return ListCustomerLabel({ paging: { limit: 999 } }).then((json) => {
      this.customerLabelList = adapterMoreSelectComData(
        json.response.customer_labels,
        'customer_label_id',
      )

      return json
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
          pay_status: [],
        },
      })
    } else {
      Object.assign(req, { stock_sheet_ids: selected })
    }

    return req
  }

  batchUpdateReceipt(
    selected: string[],
    isSelectAll: boolean,
    receiptAction: ReceiptStatusKey,
  ) {
    const req = this.getBatchReq(selected, isSelectAll)
    req.target_status = RECEIPT_STATUS[receiptAction]
    return BatchUpdateStockSheet(req).then((json) => {
      // Tip.success(
      //   getSuccessTip(receiptAction, RECEIPT_STATUS[receiptAction]) + t('成功'),
      // )
      return json
    })
  }
}

export default new Store()
