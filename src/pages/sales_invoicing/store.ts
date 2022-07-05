import { makeAutoObservable } from 'mobx'
import period_store from '../financial_manage/fiscal_period_settlement/fiscal_period_settlement/store'
import { FiscalPeriod } from 'gm_api/src/finance'
import { TableRequestParams } from '@/pages/sales_invoicing/interface'
import _ from 'lodash'
import {
  GetSkuStock,
  GetSkuStockResponse,
  ListWarehouse,
} from 'gm_api/src/inventory'
import { ListGroupUser, Role_Type } from 'gm_api/src/enterprise'
import type { ListWarehouseRequest } from 'gm_api/src/inventory'
import { ListSkuV2 } from 'gm_api/src/merchandise'

class Store {
  period_list: FiscalPeriod[] = period_store.list

  selectedStock = null

  constructor() {
    makeAutoObservable(this, undefined, { autoBind: true })
  }

  getPeriodList(data: Partial<TableRequestParams>) {
    return period_store.getSearchList(data).then((json) => {
      this.period_list = json.fiscal_periods
    })
  }

  handleChange(value: any) {
    this.selectedStock = value
  }

  // 多个出库需要用到这个接口
  getStock(sku_id: string, warehouse_ids?: string[]) {
    const req = {
      sku_id,
      warehouse_ids,
      with_additional: true,
    }
    if (!sku_id) return
    return GetSkuStock(req).then((json) => {
      const data = json.response
      // runInAction(() => {
      //   this.skuStock = data
      // })
      return data as GetSkuStockResponse
    })
  }

  // 获取仓库列表
  getWarehouseList(req?: ListWarehouseRequest) {
    const params = {
      ...req,
      paging: { limit: 999 },
      valid: 0,
    }
    return ListWarehouse(params)
  }

  fetchGroupUser() {
    return ListGroupUser({
      paging: { limit: 999, offset: 0 },
      role_types: [Role_Type.BUILT_IN_PURCHASER as number],
    })
  }

  async batchGetSkuStock<T>(
    skus: (T & { sku_id: string })[] = [],
    warehouse_id: string,
  ) {
    const getStockPromiseArr = _.map(skus, async (sku) => {
      const { sku_id } = sku
      return await this.getStock(sku_id, [warehouse_id])
    })

    const stockArr = await Promise.all(getStockPromiseArr)

    return _.map(skus, (item, index) => {
      const currStockInfo = stockArr[index].sku_stock

      return {
        ...item,
        currStockQuantity: currStockInfo?.stock?.base_unit?.quantity || '0',
      }
    })
  }

  /** 获取商品名称 */
  fetchSkuList(q: string, options = {}) {
    const requestParams = { q, ...options }
    return ListSkuV2({
      filter_params: { ...requestParams },
      paging: { limit: 999 },
      request_data: 1024 + 256,
    })
  }
}

export default new Store()
