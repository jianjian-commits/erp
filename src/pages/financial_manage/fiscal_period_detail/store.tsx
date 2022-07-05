import { makeAutoObservable } from 'mobx'
import _ from 'lodash'
import {
  ListSsuStockValue,
  ListSkuStockValue,
  ListSkuStockValueRequest,
  ExportFiscalPeriodSsuStockValue,
} from 'gm_api/src/inventory'
import { ExpandedType, FilterType } from './interface'
import {
  getStockValueAdditional,
  getSearchCategory,
} from '@/pages/sales_invoicing/util'
import {
  StockValueExpand,
  TableRequestParams,
} from '@/pages/sales_invoicing/interface'

const initFilter: FilterType = {
  begin_time: '',
  end_time: '',
  q: '',
  category: {
    category1_ids: [],
    category2_ids: [],
  },
  sort: [],
}

class Store {
  filter: FilterType = { ...initFilter }

  expanded: ExpandedType = {}

  list: Partial<StockValueExpand>[] = []

  skuIdList: string[] = [] // 获取为+号的sku | 减号不请求

  constructor() {
    makeAutoObservable(this, undefined, { autoBind: true })
  }

  updateFilter<T extends keyof FilterType>(key: T, value: FilterType[T]) {
    this.filter[key] = value
  }

  export() {
    return ExportFiscalPeriodSsuStockValue({
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
    const { begin_time, end_time, q, category, sort } = this.filter
    const { category1_ids, category2_ids } = category
    const searchParams: Omit<ListSkuStockValueRequest, 'paging'> = {
      begin_time: begin_time,
      end_time: end_time,
      with_additional: true,
      sort,
    }
    if (
      q ||
      sku_ids?.length > 0 ||
      category1_ids.length > 0 ||
      category2_ids.length > 0
    ) {
      searchParams.get_many_sku_request = {
        q,
        sku_ids,
        category_ids: getSearchCategory(category),
      }
    }
    return searchParams
  }

  fetchList = (params: TableRequestParams) => {
    const req = Object.assign({ paging: params.paging }, this.getSearchData())
    return ListSkuStockValue(req as ListSkuStockValueRequest).then((json) => {
      const { sku_stock_values, additional } = json.response
      this.list = getStockValueAdditional({
        data: sku_stock_values,
        additional: additional!,
      })
      return json.response
    })
  }
}

export default new Store()
export type { FilterType, TableRequestParams }
