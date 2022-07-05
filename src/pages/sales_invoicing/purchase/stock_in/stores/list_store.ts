import { makeAutoObservable } from 'mobx'
import moment from 'moment'
import _ from 'lodash'
import { Tip } from '@gm-pc/react'
import type { MoreSelectDataItem } from '@gm-pc/react'
import { t } from 'gm-i18n'

import {
  ListPurchaseInStockSheet,
  ExportPurchaseInStockSheet,
  StockSheet_SheetStatus,
  DeletePurchaseInStockSheet,
  BatchUpdatePurchaseInStockSheetStatus,
  Additional,
} from 'gm_api/src/inventory'
import type {
  PurchaseInStockSheet,
  ListPurchaseInStockSheetRequest,
  ExportPurchaseInStockSheetRequest,
  BatchUpdatePurchaseInStockSheetStatusRequest,
} from 'gm_api/src/inventory'
import {
  ComSupplier,
  ReceiptStatusKey,
  TableRequestParams,
} from '../../../interface'
import { RECEIPT_STATUS } from '../../../enum'
import {
  ListSupplier,
  GroupUser,
  ListGroupUser,
  GroupUser_Type,
  Role_Type,
} from 'gm_api/src/enterprise'
import { adapterMoreSelectComData, getTimestamp } from '@/common/util'
import { Filters_Bool } from 'gm_api/src/common'
import { handlePayStatus } from '@/pages/sales_invoicing/util2'
import globalStore from '@/stores/global'
import { TimeType } from 'gm_api/src/inventory/types'

type SelectedItem<V extends string | number = string> =
  | MoreSelectDataItem<V>[]
  | MoreSelectDataItem<V>

type CombineUser = GroupUser & { value: string; text: string }

interface Filter
  extends Pick<
    ListPurchaseInStockSheetRequest,
    | 'time_type'
    | 'q'
    | 'warehouse_id'
    | 'is_printed'
    | 'pay_status'
    | 'stock_sheet_status'
  > {
  begin_time: Date
  end_time: Date
  supplier_ids: SelectedItem | undefined
  creator_ids: SelectedItem | undefined
  purchaser_ids: SelectedItem | undefined
}

const initFilter: Filter = {
  time_type: TimeType.TIME_TYPE_CREATE,
  begin_time: moment().startOf('day').add(-29, 'days').toDate(),
  end_time: moment().endOf('day').toDate(),
  q: '',
  pay_status: [],
  is_printed: Filters_Bool.ALL,
  stock_sheet_status: StockSheet_SheetStatus.SHEET_STATUS_UNSPECIFIED,
  warehouse_id: undefined, // 所属仓库id
  creator_ids: undefined,
  purchaser_ids: undefined,
  supplier_ids: undefined,
}

class Store {
  filter: Filter = { ...initFilter }
  list: PurchaseInStockSheet[] = []
  supplierList: ComSupplier[] = []
  creators: CombineUser[] = []
  purchasers: CombineUser[] = []

  activeType = 'all'
  notInQuery: boolean | undefined = false
  additional: Additional = {}

  constructor() {
    makeAutoObservable(this, undefined, { autoBind: true })
  }

  changeFilter<T extends keyof Filter>(name: T, value: Filter[T]) {
    this.filter[name] = value
  }

  changeActiveType(type: string) {
    this.activeType = type
  }

  get getSearchData() {
    const {
      begin_time,
      end_time,
      pay_status,
      creator_ids,
      purchaser_ids,
      supplier_ids,
      ...rest
    } = this.filter

    const creatorIds = _.map(creator_ids, (creator) => {
      return creator?.value
    })
    const _pay_status = pay_status
      ? handlePayStatus(pay_status && pay_status[0]).value
      : undefined

    return {
      ...rest,
      begin_time: getTimestamp(begin_time)!,
      end_time: getTimestamp(end_time)!,
      creator_ids: creatorIds,
      purchaser_ids: purchaser_ids ? [purchaser_ids?.value] : [],
      supplier_ids: supplier_ids ? [supplier_ids?.value] : [],
      pay_status: _pay_status || undefined,
    }
  }

  fetchList(params: TableRequestParams) {
    const req: ListPurchaseInStockSheetRequest = Object.assign(
      { paging: params.paging, with_additional: true, without_details: true },
      this.getSearchData,
    )

    return ListPurchaseInStockSheet(req).then(({ response }) => {
      const { stock_sheets, additional } = response
      this.list = stock_sheets
      this.additional = additional!
      this.notInQuery = response.find_out_filter
      // this.setAdditional(additional!)

      return response
    })
  }

  /** 从additional里面获取需要的数据 */
  getAdditionInfo<k>(type: keyof Additional, key: string): k {
    return this.additional[type]?.[key] as k
  }

  /** 获取供应商 */
  fetchSupplier() {
    return ListSupplier({ paging: { limit: 999 } }).then((json) => {
      this.supplierList = adapterMoreSelectComData(
        json.response.suppliers!,
        'supplier_id',
        'name',
      )
      !globalStore.isLite &&
        this.supplierList.unshift({ value: '0', text: '无' } as ComSupplier)

      return json
    })
  }

  /** 获取采购员 */
  fetchGroupUser() {
    return ListGroupUser({
      paging: { limit: 999, offset: 0 },
      role_types: [Role_Type.BUILT_IN_PURCHASER as number],
    }).then((json) => {
      json.response.group_users.forEach((v) => {
        const item = { ...v, value: v.group_user_id, text: v.name }
        this.creators.push(item)
        if (v.type === GroupUser_Type.NORMAL) {
          this.purchasers.push(item)
        }
      })
      const specialItem = { value: '0', text: '无' }
      this.creators.unshift(specialItem as CombineUser)
      this.purchasers.unshift(specialItem as CombineUser)
    })
  }

  clearGroupUser() {
    this.creators = []
    this.purchasers = []
  }

  /** 删除单据 */
  deleteReceipt(index: number) {
    return DeletePurchaseInStockSheet({
      stock_sheet_id: this.list[index].purchase_in_stock_sheet_id,
    }).then(() => Tip.success(t('删除单据成功')))
  }

  export() {
    const req: ExportPurchaseInStockSheetRequest = {
      list_stock_sheet_request: {
        ...this.getSearchData,
        paging: {
          limit: 0,
        },
      },
    }

    return ExportPurchaseInStockSheet(req)
  }

  getBatchReq(selected: string[], isSelectAll: boolean) {
    const req = {}
    if (isSelectAll) {
      Object.assign(req, {
        list_stock_sheet_request: this.getSearchData,
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
    const req: BatchUpdatePurchaseInStockSheetStatusRequest = {
      ...this.getBatchReq(selected, isSelectAll),
      target_status: RECEIPT_STATUS[receiptAction]!,
    }

    return BatchUpdatePurchaseInStockSheetStatus(req).then((json) => {
      return json
    })
  }
}

export default new Store()
