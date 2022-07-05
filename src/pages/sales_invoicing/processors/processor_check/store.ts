import { getTimestamp } from '@/common/util'
import { makeAutoObservable } from 'mobx'
import moment from 'moment'
import _ from 'lodash'
import {
  DeleteProcessorCheck,
  ExportProcessorCheck,
  ListProcessorCheck,
  ListProcessorCheckRequest,
  ProcessorCheck,
  ProcessorCheck_OperateType,
} from 'gm_api/src/inventory'
import { TableRequestParams } from '@/pages/sales_invoicing/interface'
import { ListProcessor, Processor } from 'gm_api/src/production'
import { levelList } from '@/pages/customer/type'
import { getProcessorCheckAdditional } from '@/pages/sales_invoicing/util'
import { GetManySkuResponse_SkuInfo, ListSkuV2 } from 'gm_api/src/merchandise'
import { MoreSelectDataItem, Tip } from '@gm-pc/react'
import { t } from 'gm-i18n'

export interface Filter
  extends Omit<
    ListProcessorCheckRequest,
    | 'paging'
    | 'begin_time'
    | 'end_time'
    | 'time_type'
    | 'operate_type'
    | 'sku_id'
  > {
  time_type: number
  begin_time: Date
  end_time: Date
  processor_id: string
  sku_id?: MoreSelectDataItem<string>
  with_additional: boolean
  q: string
}

interface StockSheetInfo extends Omit<ProcessorCheck, 'processor_check_id'> {
  skuInfo?: GetManySkuResponse_SkuInfo
  quantity?: number | null
  base_unit_name?: string
  processor_check_id?: string
  operate_type?: ProcessorCheck_OperateType
  stock_log_id?: string
  stock_sheet_id?: string
}

const initFilter: Filter = {
  time_type: 2,
  begin_time: moment().startOf('day').add(-29, 'days').toDate(),
  end_time: moment().endOf('day').toDate(),
  processor_id: '0',
  sku_id: undefined,
  with_additional: true,
  q: '',
}

class Store {
  filter: Filter = { ...initFilter }
  stockData: levelList[] = []
  stockDataCheck: levelList[] = []
  list: StockSheetInfo[] = []
  stockList: any[] = []
  processor: Processor[] = []
  processors: Processor[] = []

  stockfilter: { [key: string]: any } = {
    processor_id: 0,
    text: undefined,
  }

  stockfiltercheck: { [key: string]: any } = {
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
      this.processors = processors
      this.processor = _.filter(processors, (item) => {
        return item.parent_id === '0'
      })
      this.stockData = _.map(this.processor, (item) => ({
        value: item.processor_id,
        text: item.name,
      }))
      this.stockDataCheck = _.map(this.processor, (item) => ({
        value: item.processor_id,
        text: item.name,
      }))
      this.stockList = json.response.processors
      return json.response.processors
    })
  }

  // 选择修改车间filter
  updateFilter(value: any, key: string) {
    this.stockfilter[key] = value
  }

  updateFiltercheck(value: any, key: string) {
    this.stockfiltercheck[key] = value
  }

  fetchSkuList(q: string) {
    return ListSkuV2({
      filter_params: { q, sku_types: [1, 2] },
      paging: { limit: 999 },
      request_data: 1024 + 256,
    })
  }

  updateSheetInfo<T extends keyof StockSheetInfo>(
    index: number,
    key: T,
    value: StockSheetInfo[T],
  ) {
    this.list[index][key] = value
  }

  deleteReceipt(index: number) {
    return DeleteProcessorCheck({
      stock_sheet_id: this.list[index].stock_sheet_id,
      processor_check_id: this.list[index].processor_check_id,
      operate_type: this.list[index].operate_type,
    }).then(() => Tip.success(t('删除单据成功')))
  }

  getSearchData() {
    const { begin_time, end_time, sku_id, time_type, ...rest } = this.filter
    return {
      ...rest,
      begin_time: getTimestamp(begin_time),
      end_time: getTimestamp(end_time),
      processor_id: this.stockfilter.processor_id,
      sku_id: sku_id?.value,
      time_type: time_type,
    }
  }

  getSearchList(data: TableRequestParams) {
    const req = Object.assign(this.getSearchData(), { paging: data.paging })
    return ListProcessorCheck(req as ListProcessorCheckRequest).then((json) => {
      const { processor_checks, additional } = json.response
      this.list = getProcessorCheckAdditional(processor_checks, additional!)
      return json.response
    })
  }

  export() {
    return ExportProcessorCheck({
      list_processor_check_request: Object.assign(this.getSearchData(), {
        paging: {
          limit: 0,
        },
      }) as ListProcessorCheckRequest,
    })
  }

  init() {
    this.stockDataCheck = []
  }
}

export default new Store()
