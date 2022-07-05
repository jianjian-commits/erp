import { makeAutoObservable } from 'mobx'
import { ListSkuStock, ExportSkuStock } from 'gm_api/src/inventory'
import type { ListSkuStockRequest, Warehouse } from 'gm_api/src/inventory'
import { ExpireType } from 'gm_api/src/inventory/types'
import { PagingResult } from 'gm_api/src/common'

import {
  SkuStockExpand,
  TableRequestParams,
} from '@/pages/sales_invoicing/interface'
import { getStockAdditional } from '@/pages/sales_invoicing/util'
import { FilterType } from '../../interface'

interface FtType
  extends Omit<
    FilterType,
    'sku_id' | 'sku_unit_id' | 'begin_time' | 'end_time' | 'batch_level'
  > {
  sku_type: number
  operate_type: number
  sku_ids?: string[]
  not_package_sub_sku_type: number
  warehouse_ids?: string
}

class Store {
  filter: FtType = {
    warehouse_ids: 0,
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
  warehouseList: Record<string, Warehouse> = {}

  handleChangeFilter = <T extends keyof FtType>(key: T, value: FtType[T]) => {
    this.filter[key] = value
  }

  constructor() {
    makeAutoObservable(this, undefined, { autoBind: true })
  }

  getSearchData() {
    const { warehouse_ids, ...ant } = this.filter

    return {
      ...ant,
      // category_ids: getSearchCategory(category_ids!),
      warehouse_ids: warehouse_ids ? [warehouse_ids] : [],
    }
  }

  getWarehouseById(warehouseId: string) {
    return this.warehouseList[warehouseId] || {}
  }

  getSkuStock = (req: TableRequestParams) => {
    const data: ListSkuStockRequest = Object.assign(this.getSearchData(), {
      paging: req.paging,
    })
    return ListSkuStock(data).then((json) => {
      const { sku_stocks, additional } = json.response
      this.list = getStockAdditional(sku_stocks!, additional!, 'inventory')
      this.paging = json.response.paging!
      this.warehouseList = additional?.warehouses!
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
