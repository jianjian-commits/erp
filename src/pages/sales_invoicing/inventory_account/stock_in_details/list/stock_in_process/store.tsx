import { makeAutoObservable } from 'mobx'
import moment from 'moment'
import _ from 'lodash'
import { ListStockLog, ExportStockLog } from 'gm_api/src/inventory'
import type { MoreSelectDataItem } from '@gm-pc/react'
import { StockLog } from 'gm_api/src/inventory/types'

import { StatisticalType, ComRouter } from '@/pages/sales_invoicing/interface'
import { getLogAdditional } from '@/pages/sales_invoicing/util'
import { OPERATE_TYPE, EXPORT_TASK_TYPE } from '@/pages/sales_invoicing/enum'
import { FilterType, TableRequestParams } from '../../types'
import { ListRoute } from 'gm_api/src/delivery'
interface FCustomerType extends FilterType {
  target_customer_ids?: MoreSelectDataItem<string>[] | undefined
}

const initFilter: FCustomerType = {
  begin_time: moment().startOf('day').add(-29, 'days').toDate(),
  end_time: moment().endOf('day').toDate(),
  q: '',
  target_customer_ids: [],
  target_route_ids: [],
  operate_type: OPERATE_TYPE.productIn, // 加工入库
  with_additional: true,
  stock_id: 0,
  warehouse_id: undefined,
}

class Store {
  filter: FCustomerType = { ...initFilter }

  list: StockLog[] = []

  routeList: ComRouter[] = []
  listStatistical: StatisticalType = {
    goodsItems: 0,
    stockMoney: 0,
    stockNumbers: 0,
    stockAverage: 0,
  }

  _handleUpdateFilter = <T extends keyof FCustomerType>(
    key: T,
    value: FCustomerType[T],
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
      task_type: EXPORT_TASK_TYPE.productIn,
    })
  }

  constructor() {
    makeAutoObservable(this, undefined, { autoBind: true })
  }

  getSearchData() {
    const {
      begin_time,
      end_time,
      target_customer_ids,
      target_route_ids,
      ...another
    } = this.filter

    return {
      begin_time: '' + moment(begin_time).format('x'),
      end_time: '' + moment(end_time).format('x'),
      target_customer_ids: _.map(target_customer_ids, ({ value }) => value),
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
        showCustomer: true,
      })
      return json.response
    })
  }

  fetchRoute = () => {
    ListRoute({ paging: { limit: 999 } }).then((json) => {
      this.routeList = _.map(json.response.routes, (routes) => ({
        ...routes,
        value: routes.route_id,
        text: routes.route_name,
      }))
      return null
    })
  }
}

export default new Store()
