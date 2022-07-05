import { makeAutoObservable, runInAction } from 'mobx'
import _ from 'lodash'
import { PaginationPaging } from '@gm-pc/react'
import {
  BasicPrice,
  BasicPriceItem,
  DeleteManyBasicPriceV2,
  ExportSpecialBasicPrice,
  ListSpecialBasicPriceV2,
  SetBasicPriceV2,
  SetSpecialBasicPriceV2,
  Sku,
} from 'gm_api/src/merchandise'
import { FilterOptions } from './type'
import { message } from 'antd'

export interface PublicListItem {
  basic_price: BasicPrice
  sku: Sku
}

const INITFILTER: FilterOptions = {
  search_text: '',
  category_id: '0',
}

class Store {
  constructor() {
    makeAutoObservable(this, undefined, { autoBind: true })
  }

  customerId?: string

  filter: FilterOptions = { ...INITFILTER }
  count = 0

  list: PublicListItem[] = []

  expanded: { [key: number]: boolean } = {}

  updateFilter<T extends keyof FilterOptions>(key: T, value: FilterOptions[T]) {
    this.filter[key] = value
  }

  getSearchData() {
    return {
      ...this.filter,
    }
  }

  async fetchList(params: { paging: PaginationPaging }) {
    const req = Object.assign({ paging: params.paging }, this.getSearchData())
    const { response: res } = await ListSpecialBasicPriceV2({
      customer_id: this.customerId!,
      ...req,
    })
    runInAction(() => {
      this.list = res.basic_prices!.map((bp) => {
        return {
          basic_price: bp,
          sku: res.sku_map![bp.sku_id!],
        }
      })
      this.expanded = this.list.reduce((pre, cur, i) => {
        pre[i] = true
        return pre
      }, {} as any)
      this.count = res.paging ? +res.paging.count! : 0
    })
    return res
  }

  /** 更新报价 */
  async updateBasicPrice({
    basicPrice,
    basicPriceItem,
    price,
  }: {
    basicPrice: BasicPrice
    basicPriceItem: BasicPriceItem
    price: string
  }) {
    basicPriceItem.fee_unit_price.val = price
    await SetBasicPriceV2({
      basic_prices: [basicPrice],
    })
  }

  async exportSpecialBasicPrice() {
    await ExportSpecialBasicPrice({
      customer_id: this.customerId,
    })
    message.success('导出成功')
  }

  /** 删除商品 */
  async del({ basic_price, sku }: PublicListItem) {
    await DeleteManyBasicPriceV2({
      basic_price_ids: [
        {
          quotation_id: basic_price.quotation_id!,
          sku_id: sku.sku_id,
        },
      ],
    })
  }

  /** 移除报价 */
  async remove({
    basic_price,
    itemIndex,
  }: // basic_price_item,
  {
    basic_price: BasicPrice
    itemIndex: number
  }) {
    const items = basic_price.items.basic_price_items
    items.splice(itemIndex, 1)
    await SetBasicPriceV2({
      basic_prices: [basic_price],
    })
  }

  reset(): void {
    this.filter = { ...INITFILTER }
  }
}

export default new Store()
