import { makeAutoObservable } from 'mobx'
import _ from 'lodash'
import { SkuUnitStock_PendingStock_PendingStockDetail } from 'gm_api/src/inventory/types'
import { ListPendingStock } from 'gm_api/src/inventory'
import { GetSku } from 'gm_api/src/merchandise'
import { Sku } from 'gm_api/src/merchandise/types'

import {
  TableRequestParams,
  SkuUnitMoreSelect,
} from '@/pages/sales_invoicing/interface'
import { getSkuUnit } from '@/pages/sales_invoicing/util'
import { FilterType } from '../../interface'

interface InventoryStock {
  [propName: string]: any
}

interface FtType extends Omit<FilterType, 'begin_time' | 'end_time' | 'q'> {
  pending_type: number // 预期库存类型
}

interface InventoryType {
  frozen_stock: InventoryStock
  in_transit_stock: InventoryStock
  available_stock: InventoryStock
}

const initfilter: FtType = {
  sku_id: '',
  sku_unit_id: '0',
  pending_type: 0,
  with_additional: true,
}

class Store {
  filter: FtType = { ...initfilter }

  list: SkuUnitStock_PendingStock_PendingStockDetail[] = []

  // eslint-disable-next-line gm-react-app/no-observable-empty-object
  sku_info: Partial<Sku> = {}

  showUnitId = '0'

  unitList: SkuUnitMoreSelect[] = []

  inventory: InventoryType = {
    frozen_stock: {},
    in_transit_stock: {},
    available_stock: {},
  }

  constructor() {
    makeAutoObservable(this, undefined, { autoBind: true })
  }

  changePendingType() {
    const { pending_type, ...other } = this.filter
    const changeType = [
      { pending_type: 0, type: [] },
      { pending_type: 1, type: [1, 3, 4] },
      { pending_type: 2, type: [2, 5] },
    ]
    return {
      ...other,
      pending_type: _.find(changeType, { pending_type })?.type,
    }
  }

  clean() {
    this.filter = { ...initfilter }
    this.list = []
    this.sku_info = {}
    this.unitList = []
  }

  handleChangeFilter = <T extends keyof FtType>(key: T, value: FtType[T]) => {
    this.filter[key] = value
  }

  handleChangeUnitID(value: string) {
    this.showUnitId = value
  }

  getSkuUnitStock = (req: TableRequestParams) => {
    const data = Object.assign(this.changePendingType(), { paging: req.paging })
    return ListPendingStock(data).then((json) => {
      const { pending_stock_details } = json.response
      this.showUnitId = this.filter.sku_unit_id
      this.list = pending_stock_details!
      this.inventory = {
        frozen_stock: json.response.frozen_stock!,
        in_transit_stock: json.response.in_transit_stock!,
        available_stock: json.response.available_stock!,
      }
      return json.response
    })
  }

  getSkuList() {
    return GetSku({
      sku_id: this.filter.sku_id,
    }).then((json) => {
      this.unitList = getSkuUnit(json.response)!
      this.sku_info = json.response.sku!
      return json
    })
  }
}

export default new Store()
export type { FtType }
