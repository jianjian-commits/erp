import { makeAutoObservable } from 'mobx'
import _ from 'lodash'
import moment from 'moment'
import { t } from 'gm-i18n'
import { Tip } from '@gm-pc/react'

import { getTimestamp, formatDataToTree } from '@/common/util'
import { PagingResult } from 'gm_api/src/common'
import { GroupUser } from 'gm_api/src/enterprise'
import { ListProcessor } from 'gm_api/src/production'
import {
  ListMaterialOutStockSheet,
  DeleteMaterialOutStockSheet,
  ExportMaterialOutStockSheet,
  BatchUpdateMaterialOutStockSheetStatus,
} from 'gm_api/src/inventory'
import {
  ListMaterialOutStockSheetRequest,
  MaterialOutStockSheet,
} from 'gm_api/src/inventory/types'

import type {
  LevelProcess,
  ReceiptStatusKey,
  TableRequestParams,
} from '@/pages/sales_invoicing/interface'
import { getProcessorId, getProcessName } from '@/pages/sales_invoicing/util'

import { RECEIPT_STATUS, RECEIPT_TYPE } from '../../../enum'

interface Filter
  extends Omit<
    ListMaterialOutStockSheetRequest,
    'paging' | 'begin_time' | 'end_time' | 'time_type'
  > {
  time_type: number
  begin_time: Date
  end_time: Date
  creator_ids?: any
  with_additional: boolean
  /** 领料单类型是否为商品，true为是商品，否则为false */
  is_no_processor: boolean
  /** 领用部门ID集合，选择全部车间或者小组时使用 */
  processor_ids: string[]
  /** 领用部门ID，选择单个车间或小组时使用，为'0'时返回全部 */
  processor_id: string
  warehouse_id?: string
  stock_sheet_type?: number
}

const initFilter: Filter = {
  stock_sheet_type: RECEIPT_TYPE.materialOut,
  time_type: 1,
  begin_time: moment().startOf('day').add(-29, 'days').toDate(),
  end_time: moment().endOf('day').toDate(),
  q: '',
  is_printed: 0,
  creator_ids: undefined,
  with_additional: true,
  is_no_processor: false,
  processor_ids: [],
  processor_id: '0',
  warehouse_id: undefined,
}
class Store {
  filter: Filter = { ...initFilter }
  list: Array<MaterialOutStockSheet> = []
  processors: LevelProcess[] = [] // 领用部门
  processorList: any[] = []
  paging: PagingResult = { count: '0' }
  activeType = 'all' // tab active
  notInQuery: boolean | undefined = false
  groupUsers: { [key: string]: GroupUser } | undefined = {}

  constructor() {
    makeAutoObservable(this, undefined, { autoBind: true })
  }

  getProcessSelect(data: any, id: string) {
    const result = []
    if (id && id !== '0') {
      result.unshift(id)
      const processor = _.find(data, { processor_id: id })
      if (processor?.parent_id)
        !!+processor?.parent_id && result.unshift(processor?.parent_id)
    }
    return result
  }

  /** 请求列表数据 */
  fetchList(params: TableRequestParams) {
    const req: any = Object.assign(
      { paging: params.paging },
      this.getSearchData(),
    )

    return ListMaterialOutStockSheet(req).then((json) => {
      const {
        additional: { group_users, warehouses },
        stock_sheets,
      } = json.response

      this.groupUsers = group_users
      this.list =
        _.map(stock_sheets, (item) => {
          return Object.assign(item, {
            // 仓库名
            warehouse_name:
              (item.warehouse_id && warehouses?.[item.warehouse_id]?.name) ||
              '',
            // 领用部门
            processor_name: getProcessName(
              this.processorList,
              this.getProcessSelect(this.processorList, item.processor_id!),
            ),
          })
        }) || []
      this.paging = json.response.paging
      this.notInQuery = json.response.find_out_filter
      return json.response
    })
  }

  /** 删除单据 */
  deleteReceipt(index: number) {
    return DeleteMaterialOutStockSheet({
      stock_sheet_id: this.list[index].material_out_stock_sheet_id,
    }).then(() => Tip.success(t('删除单据成功')))
  }

  /** 批量提交审核 */
  batchUpdateReceipt(
    selected: string[],
    isSelectAll: boolean,
    receiptAction: ReceiptStatusKey,
  ) {
    const req = this.getBatchReq(selected, isSelectAll)
    req.target_status = RECEIPT_STATUS[receiptAction]
    return BatchUpdateMaterialOutStockSheetStatus(req).then((json) => json)
  }

  /** 导出 */
  exportMaterialOutStockSheet() {
    return ExportMaterialOutStockSheet({
      list_stock_sheet_request: Object.assign(this.getSearchData(), {
        paging: {
          limit: 0,
        },
      }),
    })
  }

  // 批量操作请求数据组装
  getBatchReq(selected: string[], isSelectAll: boolean): any {
    const { warehouse_id, stock_sheet_type } = this.filter
    const req = {
      warehouse_id,
      stock_sheet_type,
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

  // 过滤条件改变触发
  changeFilter<T extends keyof Filter>(name: T, value: Filter[T]) {
    this.filter[name] = value
  }

  // tabs 变化触发
  changeActiveType(type: string) {
    this.activeType = type
  }

  /** 获取领用部门 */
  getProcessorList() {
    ListProcessor().then((response) => {
      this.processorList = response.response.processors
      this.processors = formatDataToTree(
        response.response.processors,
        'processor_id',
        'name',
        [
          {
            value: '0',
            text: t('未指定'),
            processor_id: '0',
            name: t('未指定'),
          },
        ],
      )
    })
  }

  // 过滤条件
  getSearchData() {
    const {
      begin_time,
      end_time,
      creator_ids,
      processor_ids,
      warehouse_id,
      ...rest
    } = this.filter

    const creatorIds = _.map(creator_ids, (creator) => {
      return creator.value
    })

    return {
      ...rest,
      begin_time: getTimestamp(begin_time),
      end_time: getTimestamp(end_time),
      creator_ids: creatorIds,
      // 领用部门
      processor_id:
        processor_ids.length > 0
          ? processor_ids[processor_ids.length - 1]
          : '0',
      processor_ids: getProcessorId(this.processors, processor_ids),
      is_no_processor: !!(processor_ids!.length && processor_ids![0] === '0'),
      warehouse_id,
    }
  }
}

export default new Store()
