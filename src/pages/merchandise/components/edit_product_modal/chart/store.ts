/* eslint-disable @typescript-eslint/member-naming */
import globalStore from '@/stores/global'
import Big from 'big.js'
import {
  GetSkuReferencePrices,
  GetSkuReferencePricesResponse_InStockReferencePrice,
  GetSkuReferencePricesResponse_PurchaseReferencePrice,
  GetSkuReferencePricesResponse_QuotationReferencePrice,
  GetSkuReferencePricesResponse_ReferencePrices,
  Quotation,
  Quotation_Type,
} from 'gm_api/src/merchandise'
import { debounce, isEqual, max, mean, min, uniq } from 'lodash'
import { makeAutoObservable } from 'mobx'
import moment, { Moment } from 'moment'

interface Options {
  list: Array<{
    sku_id: string
    /** 商品单价单位 */
    unit_id: string
    /** 下单单位 */
    order_unit_id: string
    quotation_id: string
    quotation_type: Quotation_Type
  }>
}

class ChartStore {
  constructor() {
    makeAutoObservable(this)
  }

  filter = {
    begin: moment().subtract(6, 'day').startOf('day'),
    end: moment().endOf('day'),
  }

  in_stock_reference_prices: GetSkuReferencePricesResponse_QuotationReferencePrice[] =
    []

  purchase_reference_prices: GetSkuReferencePricesResponse_PurchaseReferencePrice[] =
    []

  quotation_reference_prices: GetSkuReferencePricesResponse_InStockReferencePrice[] =
    []

  get minPrice() {
    return (type: keyof GetSkuReferencePricesResponse_ReferencePrices) => {
      if (this[type].length === 0) return Big(0)
      const minPrice = min(
        this.sourceData(type).map((item) => Big(item.price).toNumber()),
      ) as number
      return Big(minPrice || 0)
    }
  }

  get maxPrice() {
    return (type: keyof GetSkuReferencePricesResponse_ReferencePrices) => {
      if (this[type].length === 0) return Big(0)
      const maxPrice = max(
        this.sourceData(type).map((item) => Big(item.price).toNumber()),
      ) as number
      return Big(maxPrice || 0)
    }
  }

  get meanPrice() {
    return (type: keyof GetSkuReferencePricesResponse_ReferencePrices) => {
      if (this[type].length === 0) return Big(0)
      const meanPrice = mean(
        this.sourceData(type).map((item) => Big(item.price).toNumber()),
      ) as number
      return Big(meanPrice || 0)
    }
  }

  get unit() {
    return (type: keyof GetSkuReferencePricesResponse_ReferencePrices) => {
      const unitId = this[type]
        .map((item) => item.prices?.unit_id)
        .filter((id) => id === this.selectedUnitId)
        .filter(Boolean)[0]
      return unitId ? globalStore.getUnit(unitId) : undefined
    }
  }

  get sourceData() {
    return (type: keyof GetSkuReferencePricesResponse_ReferencePrices) => {
      if (!this[type].length) return []
      const data: Array<{ date: string; price: number }> = []
      // 保留当天最后的
      this[type].forEach((item, i) => {
        if (item.prices?.unit_id !== this.selectedUnitId) return
        const exist = data.find(
          (item2) =>
            moment(+item.time!).format('YYYY-MM-DD') ===
            moment(item2.date).format('YYYY-MM-DD'),
        )
        const newItem = {
          date: moment(+item.time!).format('YYYY-MM-DD HH:mm:ss'),
          price: parseFloat(Big(item.prices?.val || 0).toFixed(2)),
        }
        if (exist) {
          if (moment(+item.time!).isAfter(moment(exist.date)))
            data.splice(i, 1, newItem)
        } else {
          data.push(newItem)
        }
      })
      return data
        .map((item) => {
          return {
            ...item,
            date: moment(item.date).format('YYYY-MM-DD'),
          }
        })
        .reverse()
    }
  }

  get units() {
    return (type: keyof GetSkuReferencePricesResponse_ReferencePrices) => {
      return uniq(this[type].map((item) => item.prices?.unit_id))
        .map((id) => {
          return (
            globalStore.getUnit(id!) ||
            globalStore.getCustomUnit(this.skuId, id!)
          )
        })
        .filter(Boolean)
    }
  }

  skuId = ''

  selectedUnitId = ''

  private queue: Options[] = []

  /** 合并后发出请求 */
  fetch(options: Options) {
    this.queue.push(options)
    this.fetchData()
  }

  fetchData = debounce(async () => {
    this.skuId = this.queue[0]?.list?.[0]?.sku_id || ''
    const tasks = this.queue.reduce((pre, cur, i) => {
      const exist = pre.find((item) => isEqual(item, cur))
      if (exist) {
        cur.list.forEach((item) => {
          if (exist.list.find((item2) => isEqual(item, item2))) return
          exist.list.push(item)
        })
      } else {
        pre.push(cur)
      }
      return pre
    }, [] as Options[])

    const res = await Promise.all(
      tasks.map((task) => {
        const sku_unit_filter = task.list.filter(
          (item) => item.sku_id && item.unit_id,
        )
        if (!sku_unit_filter.length) return false as any
        return GetSkuReferencePrices({
          // period: 3,
          // quotation_id: task.quotation.quotation_id,
          // quotation_type: task.quotation.type,
          sku_unit_filter,
          start_time: this.filter.begin + '',
          end_time: this.filter.end + '',
        })
      }),
    )

    this.selectedUnitId = ''
    this.in_stock_reference_prices = []
    this.purchase_reference_prices = []
    this.quotation_reference_prices = []
    res.filter(Boolean).forEach(({ response: { reference_price_map } }) => {
      const item = Object.values(
        reference_price_map || {},
      )[0] as GetSkuReferencePricesResponse_ReferencePrices
      this.in_stock_reference_prices.push(
        ...(item?.in_stock_reference_prices || []),
      )
      this.purchase_reference_prices.push(
        ...(item?.purchase_reference_prices || []),
      )
      this.quotation_reference_prices.push(
        ...(item?.quotation_reference_prices || []),
      )
    })
    this.queue = []
  })
}

const chartStore = new ChartStore()

export default chartStore
