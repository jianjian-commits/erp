import { makeAutoObservable } from 'mobx'
import moment from 'moment'
import _ from 'lodash'
import { t } from 'gm-i18n'
import { ListDataItem, Tip } from '@gm-pc/react'
import type { MoreSelectDataItem } from '@gm-pc/react'

import { Filters_Bool, PagingResult } from 'gm_api/src/common'
import {
  ListSaleOutStockSheet,
  ExportSaleOutStockSheet,
  DeleteSaleOutStockSheet,
  BatchUpdateSaleOutStockSheetStatus,
} from 'gm_api/src/inventory'
import {
  Additional,
  TimeType,
  SheetStatus,
  SaleOutStockSheet,
  ListSaleOutStockSheetRequest,
  BatchUpdateSaleOutStockSheetStatusRequest,
} from 'gm_api/src/inventory/types'
import { CustomerLabel, ListCustomerLabel } from 'gm_api/src/enterprise'

import { getTimestamp } from '@/common/util'
import { ReceiptStatusKey, TableRequestParams } from '../../../interface'
import { RECEIPT_STATUS } from '../../../enum'

type SelectedItem<V extends string | number = string> =
  | MoreSelectDataItem<V>[]
  | MoreSelectDataItem<V>

/** 过滤参数接口 */
/** Pick: 从类型定义的属性中，选取指定一组属性，返回一个新的类型定义 */
interface Filter
  extends Pick<
    ListSaleOutStockSheetRequest,
    | 'time_type'
    | 'q'
    | 'is_printed'
    | 'warehouse_id'
    | 'customer_label_ids'
    | 'stock_sheet_status'
  > {
  begin_time: Date
  end_time: Date
  estimated_time: Date
  customer_label_selected?: any
  creator_ids?: SelectedItem | undefined
}

/** 初始化过滤参数 */
const initFilter: Filter = {
  time_type: TimeType.TIME_TYPE_CREATE,
  is_printed: Filters_Bool.ALL,
  stock_sheet_status: SheetStatus.SHEET_STATUS_UNSPECIFIED,
  begin_time: moment().startOf('day').add(-29, 'days').toDate(),
  end_time: moment().endOf('day').toDate(),
  estimated_time: moment().startOf('day').toDate(),
  q: '',
  customer_label_selected: [],
  customer_label_ids: [],
  creator_ids: undefined,
  warehouse_id: undefined,
}

class Store {
  constructor() {
    makeAutoObservable(this, undefined, { autoBind: true })
  }

  // 默认 tabName
  activeType = 'all'
  // 是否在筛选条件中
  notInQuery: boolean | undefined = false
  // 客户标签
  customerLabelList: (CustomerLabel & ListDataItem<string>)[] = []
  // 过滤条件
  filter: Filter = { ...initFilter }
  // 列表数据
  list: Array<SaleOutStockSheet> = []
  paging: PagingResult = { count: 0 }
  additional: Additional = {}

  /** 过滤条件变更时触发 */
  changeFilter<T extends keyof Filter>(name: T, value: Filter[T]) {
    this.filter[name] = value
  }

  /** 切换 tabs 触发 */
  changeActiveType(type: string) {
    this.activeType = type
  }

  /** 获取客户标签 */
  getCustomerLabelList() {
    return ListCustomerLabel({ paging: { limit: 999 } }).then((json) => {
      const { customer_labels } = json.response
      this.customerLabelList = customer_labels.map((item) => {
        return {
          ...item,
          value: item.customer_label_id,
          text: item.name,
        }
      })

      return json
    })
  }

  /** 获取过滤参数并组合 */
  getFilterParams() {
    const {
      begin_time,
      end_time,
      customer_label_selected,
      creator_ids,
      warehouse_id,
      ...rest
    } = this.filter

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
      creator_ids: creatorIds,
      warehouse_id: warehouse_id,
    }
  }

  /** 列表页数据 */
  fetchList(params: TableRequestParams) {
    const req: ListSaleOutStockSheetRequest = Object.assign(
      { paging: params.paging, with_additional: true, without_details: true },
      this.getFilterParams(),
    )

    return ListSaleOutStockSheet(req).then(({ response }) => {
      const { stock_sheets, additional } = response

      this.list = stock_sheets
      this.paging = response.paging
      this.notInQuery = response.find_out_filter
      this.additional = additional!

      return response
    })
  }

  /** 从additional里面获取需要的数据 */
  getAdditionInfo<k>(type: keyof Additional, key: string): k {
    return this.additional[type]?.[key] as k
  }

  /** 删除单据 */
  deleteReceipt(index: number) {
    return DeleteSaleOutStockSheet({
      stock_sheet_id: this.list[index].sale_out_stock_sheet_id,
    }).then(() => Tip.success(t('删除单据成功')))
  }

  /** 销售出库单导出 */
  exportSaleOutStockSheet() {
    return ExportSaleOutStockSheet({
      list_stock_sheet_request: Object.assign(this.getFilterParams(), {
        paging: {
          limit: 0,
        },
      }),
    })
  }

  /** 根据 receiptAction 是批量审核通过 or 批量提交  */
  batchUpdateReceipt(
    selected: string[],
    isSelectAll: boolean,
    receiptAction: ReceiptStatusKey,
  ) {
    const req: BatchUpdateSaleOutStockSheetStatusRequest = {
      ...this.getBatchRequestParams(selected, isSelectAll),
      target_status: RECEIPT_STATUS[receiptAction],
    }

    return BatchUpdateSaleOutStockSheetStatus(req).then((json) => {
      return json
    })
  }

  /** 组合批量审核通过 or 批量提交的参数 */
  getBatchRequestParams(selected: string[], isSelectAll: boolean): any {
    const { begin_time, end_time, ...other } = this.filter

    return Object.assign(
      isSelectAll
        ? {
            list_stock_sheet_request: {
              ...other,
              begin_time: getTimestamp(begin_time),
              end_time: getTimestamp(end_time),
            },
          }
        : { stock_sheet_ids: selected },
    )
  }
}

export default new Store()
