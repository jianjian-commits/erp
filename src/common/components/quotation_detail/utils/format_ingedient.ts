import { getUnitGroupList } from '@/pages/merchandise/util'
import {
  BasicPriceItem,
  Sku,
  Ingredient as RawIngredient,
} from 'gm_api/src/merchandise'
import _ from 'lodash'
import { Ingredient } from '../interface'

interface FormatIngedientParams {
  /** 用于页面编辑组合商品原料时使用 */
  skuIndex: number
  /** 原料价格信息 */
  basicPrice?: BasicPriceItem[]
  ratioList?: RawIngredient[]
  /** 原料商品信息 */
  skuMap?: Record<string, Sku>
}

/**
 * 合并原料商品、价格、配比信息
 */
function formatIngedient(params: FormatIngedientParams): Ingredient[] {
  const { basicPrice, ratioList, skuMap, skuIndex } = params

  const result = _.map(ratioList, (item, index): Ingredient | undefined => {
    // 只能通过索引访问对应价格信息
    const priceInfo = basicPrice?.[index]
    const sku = _.get(skuMap, item.sku_id!)
    if (!priceInfo || !sku) {
      return undefined
    }
    const units = getUnitGroupList(sku).map((item) => ({
      ...item,
      text: item.label,
    }))
    const unit = _.find(
      units,
      (item) => `${item.value}` === `${priceInfo.fee_unit_price.unit_id}`,
    )
    return {
      rawBasicPrice: Object.freeze(priceInfo),
      selected: false,
      sku_id: sku.sku_id,
      sku_type: sku.sku_type,
      name: sku.name,
      unit_id: priceInfo.order_unit_id,
      fee_unit_id: priceInfo.fee_unit_price.unit_id,
      unit,
      units,
      price: priceInfo.fee_unit_price.val,
      value: sku.sku_id,
      text: sku.name,
      ratio: item.ratio,
      skuIndex,
    }
  }).filter((item): item is Ingredient => !_.isNil(item))

  return result
}

export default formatIngedient
