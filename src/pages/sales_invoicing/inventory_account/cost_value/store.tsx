import { makeAutoObservable } from 'mobx'
import moment from 'moment'
import _ from 'lodash'
import {
  ListSsuStockValue,
  ListSkuStockValue,
  ExportSsuStockValue,
  ListSkuStockValueRequest,
  StockValue,
  Additional,
} from 'gm_api/src/inventory'
import { ListFiscalPeriod } from 'gm_api/src/finance'
import { ListFiscalPeriodRequest, FiscalPeriod } from 'gm_api/src/finance/types'

import { ExpandedType, FilterType } from './interface'
import { getStockValueAdditional } from '@/pages/sales_invoicing/util'
import {
  StockValueExpand,
  TableRequestParams,
} from '@/pages/sales_invoicing/interface'

const initFilter: FilterType = {
  begin_time: moment().startOf('day').add(-29, 'days').toDate(),
  end_time: moment().endOf('day').toDate(),
  q: '',
  sort: [],
  warehouse_id: undefined,
}

const num = {
  amount: '0',
  price: '0',
  quantity: '0',
}

const initHeadDetail: StockValue = {
  begin_stock: num,
  end_stock: num,
  all_in_stock: num,
  all_out_stock: num,
}

class Store {
  filter: FilterType = { ...initFilter }

  expanded: ExpandedType = {}

  list: Partial<StockValueExpand>[] = []

  headDetail: StockValue = { ...initHeadDetail }

  skuIdList: string[] = [] // 获取为+号的sku | 减号不请求

  // 账期相关
  IsAccountPeroid = false
  accountPeroidList: FiscalPeriod[] = []

  additional: Additional = {
    warehouses: {},
  }

  constructor() {
    makeAutoObservable(this, undefined, { autoBind: true })
  }

  updateFilter<T extends keyof FilterType>(key: T, value: FilterType[T]) {
    this.filter[key] = value
  }

  changeAccountPeroid(value: number) {
    this.IsAccountPeroid = value === 2

    // 获取所有账期, 不分页
    const req: ListFiscalPeriodRequest = {
      name: '',
      paging: {
        all: true,
      },
    }
    if (value === 2) {
      ListFiscalPeriod(req).then((res) => {
        const {
          response: { fiscal_periods },
        } = res
        this.accountPeroidList = fiscal_periods
      })
    }

    // 重置日期
    if (value === 1) {
      this.filter.begin_time = moment().startOf('day').add(-29, 'days').toDate()
      this.filter.end_time = moment().endOf('day').toDate()
    }
  }

  export() {
    return ExportSsuStockValue({
      list_ssu_stock_value_request: this.getSearchData(),
    })
  }

  clear() {
    this.expanded = {}
    this.skuIdList = []
  }

  /** unuseless func */
  async changeExpanded(expanded: ExpandedType) {
    await this.getSsuInfo(expanded)
    this.expanded = expanded
  }

  getWarehouseName(warehouse_id: string) {
    return this.additional.warehouses?.[warehouse_id] || null
  }

  ifRequest(expanded: ExpandedType) {
    const sku_ids: string[] = []
    let allow = 1
    _.forEach(expanded, (value, key) => {
      if (value) sku_ids.push(this.list[+key].sku_id!)
    })
    if (sku_ids.length < this.skuIdList.length) allow = 0
    this.skuIdList = sku_ids
    return allow
  }

  getSsuInfo(expanded: ExpandedType) {
    if (!this.ifRequest(expanded)) return
    return ListSsuStockValue(this.getSearchData(this.skuIdList)).then(
      (json) => {
        const { ssu_stock_values, additional } = json.response
        _.forEach(this.list, ({ sku_id }, key) => {
          this.list[key].ssu_stock_list = _.sortBy(
            _.filter(ssu_stock_values, {
              sku_id,
            }),
            'unit_id',
          )
        })
        this.list = _.map(
          this.list,
          ({
            sku_id,
            sku_info,
            base_unit_name,
            ssu_stock_list,
            stock_value,
          }) => ({
            sku_id,
            sku_info,
            base_unit_name,
            stock_value,
            ssu_stock_list: getStockValueAdditional({
              data: ssu_stock_list!,
              additional: additional!,
              sku_info,
              base_unit_name,
            }),
          }),
        )
        return json.response
      },
    )
  }

  getSearchData(sku_ids = []) {
    const { begin_time, end_time, q, category_id, sort, warehouse_id } =
      this.filter
    const searchParams: Omit<ListSkuStockValueRequest, 'paging'> = {
      begin_time: '' + moment(begin_time).format('x'),
      end_time: '' + moment(end_time).format('x'),
      with_additional: true,
      sort,
      warehouse_id,
    }
    if (q || sku_ids?.length > 0 || category_id) {
      searchParams.get_many_sku_request = {
        filter_params: {
          q,
          sku_ids,
          category_id,
        },
      }
    }
    return searchParams
  }

  fetchList = (params: TableRequestParams) => {
    const req = Object.assign({ paging: params.paging }, this.getSearchData())
    return ListSkuStockValue(req).then((json) => {
      const { sku_stock_values, additional, total_stock_value } = json.response
      this.additional = additional
      this.list = getStockValueAdditional({
        data: sku_stock_values,
        additional: additional!,
      })
      // 传入q不为空，且list为空的情况下，total_stock_value后端返回为空，所以这里不是数组的话要设为初始值
      this.headDetail = total_stock_value ?? initHeadDetail
      return json.response
    })
  }
}

export default new Store()
export type { FilterType, TableRequestParams }
