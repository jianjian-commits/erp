import _ from 'lodash'
import {
  BasicPrice,
  GetSkuReferencePricesResponse_ReferencePrices,
  Unit,
  Sku,
} from 'gm_api/src/merchandise'

import globalStore from '@/stores/global'
import { Price } from '@gm-pc/react'
import moment from 'moment'
import { isCombineSku } from '@/pages/order/util'

/**
 * @description: 获取单价
 * @param {*} skuid
 * @param {*} basicPrices
 * @return {*}
 */
export const getSkuSalePrice = (
  skuid: string,
  basicPrice: BasicPrice,
  units: Unit[],
) => {
  // return (
  //   _.find(basicPrices, (bp) => bp.sku_id === skuid)?.items
  //     .basic_price_items?.[0].fee_unit_price.val || ''
  // )
  return _.reduce(
    basicPrice?.items?.basic_price_items,
    (pre, cur) => {
      const lineBreak = pre && '<br/>'
      const unit_id = cur.fee_unit_price.unit_id
      if (cur.current_price) {
        return pre + lineBreak + '时价'
      }
      return (
        pre +
        lineBreak +
        cur.fee_unit_price.val +
        Price.getUnit() +
        '/' +
        (globalStore.getUnitName(unit_id) ||
          _.find(units, (unit) => unit.unit_id === unit_id)?.name ||
          '')
      )
    },
    '',
  )
}

/**
 * @description: 获取最近报价
 * @param {string} skuid
 * @param {BasicPrice} basicPrice
 * @param {Unit} units
 * @param {Record} reference_price_map
 * @param {*} GetSkuReferencePricesResponse_ReferencePrices
 * @return {*}
 */
export const getReferencePrices = (
  skuid: string,
  basicPrice: BasicPrice,
  units: Unit[],
  reference_price_map: Record<
    string,
    GetSkuReferencePricesResponse_ReferencePrices
  >,
) => {
  let res
  try {
    res = _.reduce(
      basicPrice?.items?.basic_price_items,
      (pre, cur) => {
        const lineBreak = pre && '<br/>'
        const unit_id = cur.fee_unit_price.unit_id
        const price =
          reference_price_map[
            `${basicPrice.quotation_id}-${skuid}-${cur.fee_unit_price.unit_id}-${cur.order_unit_id}`
          ].quotation_reference_prices?.[0].prices?.val
        return (
          pre +
          lineBreak +
          price +
          Price.getUnit() +
          '/' +
          (globalStore.getUnitName(unit_id) ||
            _.find(units, (unit) => unit.unit_id === unit_id)?.name ||
            '')
        )
      },
      '',
    )
  } catch (error) {
    res = '-'
  }
  return res
}

/**
 * @description: 获取下单单位名称
 * @param {string} unitId
 * @param {Unit} units
 * @return {*}
 */
export const getUnitName = (
  type: 'orderUnit' | 'feeUnit',
  basicPrices: BasicPrice,
  units: Unit[],
): string => {
  return _.reduce(
    basicPrices?.items?.basic_price_items,
    (pre, cur) => {
      const lineBreak = pre && '<br/>'
      const unit_id =
        type === 'orderUnit' ? cur.order_unit_id : cur.fee_unit_price.unit_id
      return (
        pre +
        lineBreak +
        (globalStore.getUnitName(unit_id) ||
          _.find(units, (unit) => unit.unit_id === unit_id)?.name ||
          '')
      )
    },
    '',
  )
}

export const parseQuotationPeriod = (start: number, end: number) => {
  return `${moment(start).format('YYYY-MM-DD')}~${moment(end).format(
    'YYYY-MM-DD',
  )} `
}

/**
 * @description: 当开启只打印商品基本单位报价时，过滤掉不含基本单位定价的报价单商品
 *               组合商品只有子商品都是基本单位定价才把组合商品打印出来
 * @param {Record} sku_map
 * @param {*} Sku
 * @param {BasicPrice} basic_prices
 * @return {*}
 */
export const excludeSkuWithoutBaseUnit = (
  sku_map: Record<string, Sku>,
  basic_prices: BasicPrice[],
  ingredient_basic_price: { [key: string]: BasicPrice },
) => {
  return _.pickBy(sku_map, (sku, skuId) => {
    if (isCombineSku(sku)) {
      return _.every(
        sku.ingredients?.ingredients,
        (ingredient) =>
          _.find(sku_map, (sku) => sku.sku_id === ingredient.sku_id)
            ?.base_unit_id ===
          _.find(
            _.find(
              ingredient_basic_price,
              (i) => i.sku_id === ingredient.sku_id,
            )?.items.basic_price_items || [],
            (ii) => ii.order_unit_id === ingredient.order_unit_id,
          )?.fee_unit_price.unit_id,
      )
    } else {
      return _.find(basic_prices, (bp) => {
        return (
          bp.sku_id === skuId &&
          _.find(bp.items.basic_price_items, (bp_item) => {
            return bp_item.fee_unit_price.unit_id === sku.base_unit_id
          })
        )
      })
    }
  })
}
