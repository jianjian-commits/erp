import globalStore from '@/stores/global'
import Big from 'big.js'
import {
  GetSalePriceData,
  GetSalePriceDataRequest_Filter,
  GetSalePriceDataResponse_SaleReferencePrice,
} from 'gm_api/src/order'
import { max, mean, min, uniq } from 'lodash'
import { makeAutoObservable } from 'mobx'
import moment, { Moment } from 'moment'

class ChartStore {
  constructor() {
    makeAutoObservable(this)
  }

  filter = {
    begin: moment().subtract(6, 'day').startOf('day'),
    end: moment().endOf('day'),
  }

  sale_reference_prices: GetSalePriceDataResponse_SaleReferencePrice[] = []

  get minPrice() {
    if (this.sale_reference_prices.length === 0) return Big(0)
    const minPrice = min(
      this.sourceData.map((item) => Big(item.price).toNumber()),
    ) as number
    return Big(minPrice || 0)
  }

  get maxPrice() {
    if (this.sale_reference_prices.length === 0) return Big(0)
    const maxPrice = max(
      this.sourceData.map((item) => Big(item.price).toNumber()),
    ) as number
    return Big(maxPrice || 0)
  }

  get meanPrice() {
    if (this.sale_reference_prices.length === 0) return Big(0)
    const meanPrice = mean(
      this.sourceData.map((item) => Big(item.price).toNumber()),
    ) as number
    return Big(meanPrice || 0)
  }

  get unit() {
    const unitId = this.sale_reference_prices
      .map((item) => item.prices?.price?.unit_id)
      .filter(Boolean)[0]
    return unitId
      ? globalStore.getUnit(unitId) ||
          globalStore.getCustomUnit(this.skuId, unitId)
      : undefined
  }

  get sourceData() {
    return this.sale_reference_prices
      .map((item) => {
        const unitVal = item.prices?.price

        return {
          date: moment(+item.time!).format('YYYY-MM-DD'),
          price: Big(unitVal?.val || 0).toNumber(),
        }
      })
      .reverse()
  }

  skuId = ''

  async fetch({
    sku_unit_filter,
  }: {
    sku_unit_filter: GetSalePriceDataRequest_Filter
  }) {
    this.skuId = sku_unit_filter.sku_id || ''
    const {
      response: { sale_reference_prices_list },
    } = await GetSalePriceData({
      start_time: this.filter.begin + '',
      end_time: this.filter.end + '',
      sku_unit_filter: [sku_unit_filter],
    })
    this.sale_reference_prices =
      sale_reference_prices_list?.[0]?.sale_reference_prices || []
  }
}

const chartStore = new ChartStore()

export default chartStore
