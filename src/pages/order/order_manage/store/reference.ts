/**
 * 复用 参考成本 部分的代码
 *
 * */

import { MenuDetailItemSsuProps } from '@/common/components/quotation_detail/interface'
import { convertUnit } from '@/common/util'
import { SkuDetail } from '@/pages/order/interface'
import {
  DetailListItem,
  Sku,
} from '@/pages/order/order_manage/components/interface'
import { isCombineSku } from '@/pages/order/util'
import Big from 'big.js'
import {
  GetManyReferencePrice,
  GetSkuReferencePrices,
  GetSkuReferencePricesRequest_Filter,
  GetSkuReferencePricesResponse_ReferencePrices,
  Ssu,
  Ssu_Ingredients,
  Ssu_Ingredients_SsuRatio,
  Unit,
  UnitValue,
} from 'gm_api/src/merchandise'
import {
  GetSalePriceData,
  GetSalePriceDataRequest_Filter,
  GetSalePriceDataResponse_SaleReferencePrices,
} from 'gm_api/src/order'
import { isNull, uniq } from 'lodash'
import { makeAutoObservable } from 'mobx'

export class ReferenceStore {
  constructor() {
    makeAutoObservable(this)
  }

  referencePriceMap: { [key: string]: UnitValue } = {}
  calculatedMap: { [key: string]: UnitValue } = {}

  fetchReferencePrices(list: DetailListItem[] = []) {
    return GetManyReferencePrice({
      sku_ids: uniq(list.map(({ sku_id }) => sku_id || null)) as string[],
      need_bom_ref: true,
    }).then(({ response: res }) => {
      if (!res.reference_price_map) return
      Object.keys(res.reference_price_map).forEach((key) => {
        const unitValue = res.reference_price_map![key]
        this.referencePriceMap[key] = unitValue
        const sku = list.find(({ sku_id }) => sku_id === key)!
        if (!isCombineSku(sku)) {
          this.calculatedMap[key] = this.getUnitReferencePrice(sku)
        } else if (isCombineSku(sku)) {
          const ingredients =
            (sku as MenuDetailItemSsuProps).ssu_ingredients ||
            (sku as any).ingredientsInfo || // 新建订单字段名是这个
            sku.ingredients
          const { val: total } = this.calcCombinedSsuReferencePrice(
            ingredients as Ssu_Ingredients,
          )
          this.calculatedMap[key] = {
            unit_id: '0',
            val: Big(total || 0).toString(),
          }
        }
      })
    })
  }

  /** 计算组合商品的成本，传入组合商品ssu的ingredients */
  calcCombinedSsuReferencePrice(ingredients: Ssu_Ingredients) {
    const total = ingredients?.ssu_ratios?.reduce((pre, cur, i) => {
      let { val: cost } = this.getUnitReferencePrice(cur) as UnitValue
      // // 要求保留两位小数后再算
      cost = Big(cost || 0).toFixed(2)
      const unitVal: UnitValue = {
        val: cur.ratio || '0',
        unit_id: cur.use_unit_id,
      }
      const convertedUnitVal = convertUnit(unitVal, cur.unit as Unit, true).val
      return Big(pre)
        .plus(Big(cost || 0).times(convertedUnitVal || 0))
        .toNumber()
    }, 0)
    return {
      unit_id: '0',
      val: Big(total || 0).toString(),
    } as UnitValue
  }

  /** 获取商品的参考成本单价（计量单位） */
  getUnitReferencePrice(sku: Ssu | Ssu_Ingredients_SsuRatio) {
    const unitValue = this.referencePriceMap?.[sku.sku_id as string]
    if (!unitValue) return {} as UnitValue
    // return convertUnit(unitValue, sku.unit as Unit)
    return unitValue
  }

  /** 最近销售价 */
  sale_reference_prices_list: GetSalePriceDataResponse_SaleReferencePrices[] =
    []

  /**
   * 拉取最近销售价
   * @param sku_unit_filter
   *  商品id
   *  报价单位 fee_unit_id.unit_id，此时与下单单位保持一致
   *  下单单位 order_unit_id
   */
  async fetchSalePriceData(sku_unit_filter: GetSalePriceDataRequest_Filter[]) {
    if (!sku_unit_filter.length) return
    /**
     * 只需要1条记录的时候传size=1，需要展示图表的时候传begin_time,end_time，下单时间
     * begin_time,end_time和size不要同时传，同时传的话会从begin_time,end_time的结果里取size条记录返回
     */
    const {
      response: { sale_reference_prices_list },
    } = await GetSalePriceData({
      period: 3,
      sku_unit_filter: sku_unit_filter,
      // receive_customer_id: receive_customer_id,
    })
    this.sale_reference_prices_list = sale_reference_prices_list || []
  }
}

export default new ReferenceStore()
