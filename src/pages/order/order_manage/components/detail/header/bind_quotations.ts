import _ from 'lodash'
import { SkuShape } from '@/pages/order/order_manage/components/detail/list/components/cell_sku_selector/search_merchandise'
import { BasicPrice, SetBasicPriceV2 } from 'gm_api/src/merchandise'

interface RawSkuUnit {
  /**
   * 商品 id
   */
  sku_id: string
  /**
   * 单位 id
   */
  unit_id: string
  /**
   * 单价
   */
  price: string
}

interface SkuUnitShape {
  /**
   * 商品 id
   */
  sku_id: string
  /**
   * 报价单 id
   */
  quotation_id: string
  /**
   * 价格
   */
  items: Items
}

interface Items {
  basic_price_items: Basicpriceitem[]
}

interface Basicpriceitem {
  // 单位 id
  order_unit_id: string
  // 最小下单量
  minimum_order_number?: string
  fee_unit_price: Feeunitprice
  // 是否上架
  on_shelf: boolean
}

interface Feeunitprice {
  // 单价
  val: string
  unit_id: string
}

function handleUnitList(skuList: SkuShape[]) {
  // sku_id和unit_id 拼接 为 key ==> sku_id__unit_id
  const unitMap = new Map<string, RawSkuUnit>()
  // sku_id 为 key
  const result = new Map<string, Basicpriceitem[]>()

  _.forEach(skuList, (item) => {
    const key = `${item.sku_id}__${item.unit_id}`
    if (!unitMap.has(key)) {
      unitMap.set(key, {
        sku_id: item.sku_id!,
        unit_id: item.unit_id!,
        price: `${item.price || 0}`,
      })
    }
  })

  unitMap.forEach((item) => {
    const { sku_id } = item
    const value = result.get(sku_id) || []
    value.push({
      order_unit_id: item.unit_id,
      fee_unit_price: {
        unit_id: item.unit_id,
        val: item.price,
      },
      on_shelf: true,
    })
    result.set(sku_id, value)
  })

  return result
}

/**
 * 从商品列表中过滤出需要报价单
 * @param quotation_id 报价单 id
 * @param skuList 需要关联报价单的商品列表
 */
export function formateSkuList(quotation_id: string, skuList: SkuShape[]) {
  const list = _.filter(skuList, (item) => !!item.withoutInQuotations)
  const result = new Map<string, SkuUnitShape>()
  const unitMap = handleUnitList(skuList)
  list.forEach((item) => {
    let skuUnit = result.get(item.sku_id!)
    if (_.isNil(skuUnit)) {
      skuUnit = {
        sku_id: item.sku_id!,
        quotation_id,
        items: {
          basic_price_items: (unitMap.get(item.sku_id) || []).map((price) => ({
            ...price,
            minimum_order_number: '0.01',
          })),
        },
      }
    }
    result.set(item.sku_id!, skuUnit)
  })
  return { list: Array.from(result.values()) as BasicPrice[], skuList: list }
}

/**
 * 非报价单商品加入报价单
 * sku 需要 `withoutInQuotations` 字段标识该商品是否不在报价单中，默认为 false | undefined
 *
 * @param quotation_id 报价单 id
 * @param skuList 需要关联报价单的商品列表
 */
async function bindQuotations(quotation_id: string, skuList: SkuShape[]) {
  try {
    const { list, skuList: sku } = formateSkuList(quotation_id, skuList)
    await SetBasicPriceV2({ basic_prices: list })
    const skuNameList = _.map(sku, (item) => item.name)
    // 返回 sku 名称数组，方便显示成功提示
    return Promise.resolve(Array.from(new Set(skuNameList)))
  } catch (error) {
    return Promise.reject(error)
  }
}

export default bindQuotations
