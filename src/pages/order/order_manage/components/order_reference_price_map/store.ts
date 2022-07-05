/* eslint-disable @typescript-eslint/member-naming */
import { makeAutoObservable } from 'mobx'
import {
  GetSkuReferencePrices,
  GetSkuReferencePricesResponse_ReferencePrices,
} from 'gm_api/src/merchandise'
import { debounce } from 'lodash'
import { ChildrenType } from '@/pages/merchandise/price_manage/customer_quotation/data'

interface Options {
  record: Pick<ChildrenType, 'parentId' | 'fee_unit_price' | 'order_unit_id'>
}

class ReferencePriceMapStore {
  constructor() {
    makeAutoObservable(this)
  }

  reference_price_map: {
    [key: string]: GetSkuReferencePricesResponse_ReferencePrices
  } = {}

  private queue: Options[] = []

  /** 合并后发出请求 */
  async fetch(options: Options) {
    this.queue.push(options)
    this.fetchData()
  }

  private fetchData = debounce(async () => {
    const tasks = this.queue.reduce((pre, cur, i) => {
      const exist = pre.find(
        (item) =>
          item.record.order_unit_id === cur.record.order_unit_id &&
          item.record.parentId === cur.record.parentId,
      )
      if (!exist) {
        pre.push(cur)
      }
      return pre
    }, [] as Options[])

    const sku_unit_filter = tasks
      .filter((item) => item.record.parentId && item.record.order_unit_id)
      .map((item) => {
        return {
          sku_id: item.record.parentId,
          unit_id: item.record.order_unit_id,
          order_unit_id: item.record.order_unit_id,
        }
      })
    if (!sku_unit_filter.length) return

    const {
      response: { reference_price_map },
    } = await GetSkuReferencePrices({
      period: 3,
      sku_unit_filter,
    })
    Object.assign(this.reference_price_map, reference_price_map)
    this.queue = []
  })
}

const referencePriceMapStore = new ReferencePriceMapStore()
export default referencePriceMapStore
