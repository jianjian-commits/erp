import { makeAutoObservable } from 'mobx'
import moment from 'moment'
import _ from 'lodash'
import {
  ListStockLog,
  OperateType,
  StockLog,
  ExportStockLog,
} from 'gm_api/src/inventory'
import { TableRequestParams } from '@/pages/sales_invoicing/interface'
import { FtLog } from '../../interface'
import { EXPORT_TASK_TYPE } from '@/pages/sales_invoicing/enum'
import {
  combineCategoryAndSku,
  getLogAdditional,
} from '@/pages/sales_invoicing/util'

const initFilter: FtLog = {
  begin_time: moment().startOf('date').add(-29, 'days').toDate(),
  end_time: moment().endOf('date').toDate(),
  operate_types: 0,
  sku_id: '0',
  with_additional: true,
  target_id: '0',
}

interface headDetailType {
  [key: string]: string
}

class Store {
  filter: FtLog = { ...initFilter }

  list: StockLog[] = []

  headDetail: headDetailType = {
    sku_name: '',
    customer_name: '',
    customer_code: '',
  }

  constructor() {
    makeAutoObservable(this, undefined, { autoBind: true })
  }

  export() {
    return ExportStockLog({
      list_stock_log_request: Object.assign(this.getSearchData(), {
        paging: {
          limit: 0,
        },
      }),
      task_type: EXPORT_TASK_TYPE.turnoverLog,
    })
  }

  changeFilter<T extends keyof FtLog>(key: T, value: FtLog[T]) {
    this.filter[key] = value
  }

  getSearchData() {
    const { begin_time, end_time, operate_types, ...other } = this.filter
    return {
      begin_time: moment(begin_time).format('x'),
      end_time: moment(end_time).format('x'),
      operate_types:
        operate_types === 0
          ? _.concat(
              [],
              OperateType.OPERATE_TYPE_TURNOVER_LOAN,
              OperateType.OPERATE_TYPE_TURNOVER_REVERT,
            )
          : _.concat([], operate_types),
      ...other,
    }
  }

  getSearchList(data: TableRequestParams) {
    const req = Object.assign(this.getSearchData(), { paging: data.paging })
    return ListStockLog(req).then((json) => {
      const { stock_logs, additional } = json.response
      const { category_map, sku_map, customers } = additional!
      const skuinfos = combineCategoryAndSku(category_map, sku_map)

      const customerInfo = customers![_.keys(customers)[0]]!

      this.list = getLogAdditional({
        data: stock_logs!,
        additional: additional!,
        showDriver: true,
        showSsuPrice: true,
      })
      this.headDetail = {
        sku_name: skuinfos![_.keys(skuinfos)[0]]?.sku?.name!,
        customer_name: customerInfo?.name,
        customer_code: customerInfo?.customized_code!,
      }
      return json.response
    })
  }
}

export default new Store()
