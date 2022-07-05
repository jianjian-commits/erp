import { getTimestamp } from '@/common/util'
import { makeAutoObservable } from 'mobx'
import moment from 'moment'
import _ from 'lodash'
import {
  ExportProcessorStatistics,
  ListProcessorCheckRequest,
  ListProcessorStatistics,
  ListProcessorStatisticsRequest,
  ProcessorCheck,
  ProcessorCheck_OperateType,
} from 'gm_api/src/inventory'
import { TableRequestParams } from '@/pages/sales_invoicing/interface'
import { ListProcessor, Processor } from 'gm_api/src/production'
import { levelList } from '@/pages/customer/type'
import { getProcessorStatisticsAdditional } from '@/pages/sales_invoicing/util'
import { GetManySkuResponse_SkuInfo, ListSkuV2 } from 'gm_api/src/merchandise'
import { MoreSelectDataItem } from '@gm-pc/react'

export interface Filter
  extends Omit<
    ListProcessorStatisticsRequest,
    'paging' | 'begin_time' | 'end_time' | 'operate_type' | 'sku_id'
  > {
  begin_time: Date
  end_time: Date
  processor_id?: string
  sku_id?: MoreSelectDataItem<string>
  with_additional?: boolean
  with_details?: boolean
  time_type: number
}

interface StockSheetInfo extends Omit<ProcessorCheck, 'processor_check_id'> {
  skuInfo?: GetManySkuResponse_SkuInfo
  quantity?: number | null
  base_unit_name?: string
  processor_check_id?: string
  operate_type?: ProcessorCheck_OperateType
  stock_log_id?: string
  stock_sheet_id?: string
  check_time?: string
}

const initFilter: Filter = {
  begin_time: moment().startOf('day').add(-29, 'days').toDate(),
  end_time: moment().endOf('day').toDate(),
  processor_id: '0',
  sku_id: undefined,
  with_additional: true,
  with_details: true,
  time_type: 2,
}

class Store {
  filter: Filter = { ...initFilter }
  stockData: levelList[] = []
  list: StockSheetInfo[] = []
  processor: Processor[] = []

  stockfilter: { [key: string]: any } = {
    processor_id: 0,
    text: undefined,
  }

  processor_id = '' || undefined

  constructor() {
    makeAutoObservable(this, undefined, { autoBind: true })
  }

  changeFilter<T extends keyof Filter>(key: T, value: Filter[T]) {
    this.filter[key] = value
  }

  // 获取车间列表
  fetchStockList() {
    return ListProcessor({
      paging: { limit: 999 },
    }).then((json) => {
      const { processors } = json.response
      this.processor = _.filter(processors, (item) => {
        return item.parent_id === '0'
      })
      this.stockData = _.map(this.processor, (item) => ({
        value: item.processor_id,
        text: item.name,
      }))
      return json.response.processors
    })
  }

  // 选择修改车间filter
  updateFilter(value: any, key: string) {
    this.stockfilter[key] = value
  }

  fetchSkuList(q: string) {
    return ListSkuV2({
      filter_params: { q, sku_types: [1, 2] },
      paging: { limit: 999 },
      request_data: 1024 + 256,
    })
  }

  getSearchData() {
    const { begin_time, end_time, sku_id, ...rest } = this.filter

    return {
      ...rest,
      begin_time: getTimestamp(begin_time),
      end_time: getTimestamp(end_time),
      processor_id: this.stockfilter.processor_id,
      sku_id: sku_id?.value,
    }
  }

  getSearchList(data: TableRequestParams) {
    const req = Object.assign(this.getSearchData(), { paging: data.paging })
    return ListProcessorStatistics(req as ListProcessorStatisticsRequest).then(
      (json) => {
        const { processor_statistics, additional } = json.response
        this.list = getProcessorStatisticsAdditional(
          processor_statistics!,
          additional!,
        )
        return json.response
      },
    )
  }

  export() {
    return ExportProcessorStatistics({
      list_request: Object.assign(this.getSearchData(), {
        paging: {
          limit: 0,
        },
      }) as ListProcessorCheckRequest,
    })
  }
}

export default new Store()
