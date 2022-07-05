import { makeAutoObservable } from 'mobx'
import moment from 'moment'
import _ from 'lodash'
import { ListStockLog, ExportStockLog } from 'gm_api/src/inventory'
import { StockLog } from 'gm_api/src/inventory/types'
import { ListProcessor } from 'gm_api/src/production'

import {
  getLogAdditional,
  getSearchCategory,
  getProcessorId,
} from '@/pages/sales_invoicing/util'
import {
  StatisticalType,
  LevelProcess,
} from '@/pages/sales_invoicing/interface'
import { OPERATE_TYPE, EXPORT_TASK_TYPE } from '@/pages/sales_invoicing/enum'
import { FilterType, TableRequestParams } from '../../types'
import { formatDataToTree } from '@/common/util'
import { t } from 'gm-i18n'

const initFilter: FilterType = {
  begin_time: moment().startOf('day').add(-29, 'days').toDate(),
  end_time: moment().endOf('day').toDate(),
  q: '',
  operate_type: OPERATE_TYPE.materialOut, // 领料出库
  with_additional: true,
  processor_ids: [],
  warehouse_id: undefined,
}

class Store {
  filter: FilterType = { ...initFilter }

  processors: LevelProcess[] = []
  list: StockLog[] = []
  listStatistical: StatisticalType = {
    goodsItems: 1,
    stockMoney: 0,
    stockNumbers: 0,
    stockAverage: 0,
  }

  _handleUpdateFilter = <T extends keyof FilterType>(
    key: T,
    value: FilterType[T],
  ) => {
    this.filter[key] = value
  }

  _handleExport = () => {
    return ExportStockLog({
      list_stock_log_request: Object.assign(this.getSearchData(), {
        paging: {
          limit: 0,
        },
      }),
      task_type: EXPORT_TASK_TYPE.materialOut,
    })
  }

  constructor() {
    makeAutoObservable(this, undefined, { autoBind: true })
  }

  fetchProcessor() {
    ListProcessor().then((response) => {
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

  getSearchData() {
    const { begin_time, end_time, processor_ids, ...another } = this.filter
    return {
      begin_time: '' + moment(begin_time).format('x'),
      end_time: '' + moment(end_time).format('x'),
      processor_ids: getProcessorId(this.processors, processor_ids!),
      is_no_processor: !!(processor_ids!.length && processor_ids![0] === '0'),
      ...another,
    }
  }

  fetchList = (params: TableRequestParams) => {
    const req = Object.assign({ paging: params.paging }, this.getSearchData())
    return ListStockLog(req).then((json) => {
      const { additional, stock_logs } = json.response
      this.list = getLogAdditional({
        data: stock_logs!,
        additional: additional!,
      })
      return json.response
    })
  }
}

export default new Store()
