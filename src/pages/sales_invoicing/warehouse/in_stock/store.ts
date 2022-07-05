import { makeAutoObservable } from 'mobx'
import { ExpireType, ListSkuStock, ExportSkuStock } from 'gm_api/src/inventory'
import { SortBy, PagingResult } from 'gm_api/src/common'
import {
  SkuStockExpand,
  CategoryType,
  TableRequestParams,
} from '@/pages/sales_invoicing/interface'
import {
  getStockAdditional,
  getSearchCategory,
} from '@/pages/sales_invoicing/util'

interface FilterType {
  begin_time: Date
  end_time: Date
  sku_id: string
  sku_unit_id: string
  q: string
  with_additional: boolean
  category_ids?: CategoryType
  batch_level: number
  expire_type: ExpireType
  sort: SortBy[]
}

interface FtType
  extends Omit<
    FilterType,
    'sku_id' | 'sku_unit_id' | 'begin_time' | 'end_time' | 'batch_level'
  > {
  sku_type: number
  operate_type: number
  sku_ids?: string[]
  not_package_sub_sku_type: number
}

class Store {
  constructor() {
    makeAutoObservable(this, undefined, { autoBind: true })
  }

  filter: FtType = {
    category_ids: {
      category1_ids: [],
      category2_ids: [],
    },
    operate_type: 0,
    sku_type: 0,
    q: '',
    with_additional: true,
    expire_type: ExpireType.EXPIRE_TYPE_UNSPECIFIED,
    not_package_sub_sku_type: 0,
    sort: [],
  }

  list: SkuStockExpand[] = []

  paging: PagingResult = { count: '0' }

  handleChangeFilter = <T extends keyof FtType>(key: T, value: FtType[T]) => {
    this.filter[key] = value
  }

  getSearchData() {
    const { category_ids, ...ant } = this.filter

    return {
      category_ids: getSearchCategory(category_ids!),
      ...ant,
    }
  }

  getSkuStock = (req: TableRequestParams) => {
    const data = Object.assign(this.getSearchData(), { paging: req.paging })
    return ListSkuStock(data).then((json) => {
      const { sku_stocks, additional } = json.response
      this.list = getStockAdditional(sku_stocks!, additional!, 'inventory')
      this.paging = json.response.paging!
      return json.response
    })
  }

  export() {
    return ExportSkuStock({
      list_sku_stock_request: Object.assign(this.getSearchData(), {
        paging: {
          limit: 0,
        },
      }),
    })
  }
}

export default new Store()
export type { FtType }
