/* eslint-disable @typescript-eslint/member-naming */
import { makeAutoObservable, when } from 'mobx'
import {
  GetSkuReferencePrices,
  GetSkuReferencePricesResponse_ReferencePrices,
  Quotation,
  Quotation_Type,
  UnitValue,
} from 'gm_api/src/merchandise'
import { debounce, isEqual } from 'lodash'

interface Record {
  sku_id: string
  /** 商品单价单位 */
  unit_id: string
  /** 下单单位 */
  order_unit_id: string
  quotation_id: string
  quotation_type: Quotation_Type
}

interface Options {
  records: Array<Record>
}

class ReferencePriceMapStore {
  constructor() {
    makeAutoObservable(this)
  }

  reference_price_map: {
    [key: string]: GetSkuReferencePricesResponse_ReferencePrices
  } = {}

  private queue: Record[] = []

  /** 合并后发出请求 */
  async fetch(options: Options) {
    this.queue.push(...options.records)
    this.fetchData()
  }

  private fetchData = debounce(async () => {
    const tasks = this.queue.reduce((pre, cur, i) => {
      const exist = pre.find((item) => isEqual(cur, item))
      if (!exist) {
        pre.push(cur)
      }
      return pre
    }, [] as Record[])

    const sku_unit_filter = tasks
      .filter((item) => item.sku_id && item.order_unit_id)
      .map((item) => {
        return {
          sku_id: item.sku_id,
          unit_id: item.unit_id,
          order_unit_id: item.order_unit_id,
        }
      })
    if (!sku_unit_filter.length) return

    const {
      response: { reference_price_map },
    } = await GetSkuReferencePrices({
      period: 3,
      sku_unit_filter: tasks,
    })
    Object.assign(this.reference_price_map, reference_price_map)

    this.queue = []
  })
}

const referencePriceMapStore = new ReferencePriceMapStore()
export default referencePriceMapStore
