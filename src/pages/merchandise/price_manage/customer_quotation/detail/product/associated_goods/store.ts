import { Key } from 'react'
import { makeAutoObservable } from 'mobx'
import {
  Sku,
  SetBasicPriceV2,
  SetBasicPriceV2Request,
} from 'gm_api/src/merchandise'

class Store {
  constructor() {
    makeAutoObservable(this, undefined, { autoBind: true })
  }

  selectedRows: Sku[] = []
  selectedRowKeys: Key[] = []

  setSelectedInfo(keys: Key[], rows: Sku[]) {
    this.selectedRowKeys = keys
    this.selectedRows = rows
  }

  clearStore() {
    this.selectedRows = []
    this.selectedRowKeys = []
  }

  /**
   * 提交绑定商品
   */
  onSubmit(params: SetBasicPriceV2Request) {
    return SetBasicPriceV2({ basic_prices: params } as any)
  }
}

export default new Store()
