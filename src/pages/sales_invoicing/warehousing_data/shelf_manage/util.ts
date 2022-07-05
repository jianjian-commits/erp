import { ListBatchResponse } from 'gm_api/src/inventory'
import { SkuForShelf, SkuForShow } from './interface'
import type { GetShelfStockResponse } from 'gm_api/src/inventory'
import _ from 'lodash'
import Big from 'big.js'
import globalStore from '@/stores/global'
import { t } from 'gm-i18n'
import { imageDomain } from '@/common/service'
import { combineCategoryAndSku } from '@/pages/sales_invoicing/util'

// 转换成需要的数据结构
export const getSkuFromBatch = (data: ListBatchResponse): SkuForShow[] => {
  const result: SkuForShow[] = []
  const skuMap = new Map<string, SkuForShelf[]>()
  const { category_map, sku_map } = data.additional!
  const skuinfos = combineCategoryAndSku(category_map, sku_map)

  _.each(data.batches, (item) => {
    const sku = skuinfos![item.sku_id]!
    const skuBaseUnit = globalStore.getUnit(sku.sku!.base_unit_id)
    const ssu = sku?.ssu_map![item.stock?.sku_unit?.unit_id!]
    const targetSsu = ssu
      ? ssu.ssu
      : { name: `${skuBaseUnit?.name}(${t('基本单位')})` }
    const skuItem = {
      ...item,

      imageUrl: imageDomain + sku.sku!.repeated_field!.images![0]?.path,
      sku_name: skuinfos![item.sku_id].sku?.name!, // sku名称
      ssu_name: targetSsu!.name!, // 规格名称
      sku_customized_code: sku.sku?.customize_code!,
      sku_base_unit_name: skuBaseUnit.name,
      sku_base_unit_id: sku.sku?.base_unit_id,
      units: sku?.sku?.units,

      sku_stock_base_quantity: item.stock?.base_unit?.quantity!, // 批次商品数量
      sku_stock_base_price: item.stock?.base_unit?.price!, // 批次商品价值
    }
    if (skuMap.get(item.sku_id)) {
      skuMap.get(item.sku_id)!.push(skuItem)
    } else {
      skuMap.set(item.sku_id, [skuItem])
    }
  })

  for (const [k, v] of skuMap.entries()) {
    const sku: SkuForShow = {
      batch_count: v.length,
      sku_id: k,
      sku_name: v[0].sku_name,
      ssu_name: v[0].ssu_name,
      stock_num: 0,
      stock_money: 0,
      imageUrl: v[0].imageUrl,
      sku_customized_code: v[0].sku_customized_code,
      sku_base_unit_name: v[0].sku_base_unit_name,
      units: v[0]?.units,
      sku_base_unit_id: v[0]?.sku_base_unit_id,
    }
    _.each(v, (item) => {
      sku.stock_num = +Big(item.sku_stock_base_quantity).plus(sku.stock_num)
      sku.stock_money = +Big(item.sku_stock_base_price)
        .times(item.sku_stock_base_quantity)
        .plus(sku.stock_money)
    })

    result.push(sku)
  }

  return result
}

export const getSkuFromBatchV2 = (res: GetShelfStockResponse) => {
  const {
    additional: { skuinfos, units },
    shelf_stocks,
  } = res

  return _.map(shelf_stocks, (shelf_stock) => {
    const sku = skuinfos?.[shelf_stock?.sku_id!].sku
    const skuBaseUnit = globalStore.getUnit(sku.base_unit_id)
    const skuSecondUnit = globalStore.getUnitName(
      shelf_stock?.second_base_unit_id!,
    )
    return {
      ...shelf_stock,
      imageUrl: imageDomain + sku!.repeated_field!.images![0]?.path,
      // name: sku?.name,
      sku_name: sku?.name,
      sku_id: sku.sku_id,
      sku_customized_code: sku.customize_code,
      second_base_unit_ratio: sku.second_base_unit_ratio,
      second_base_unit_id: sku.second_base_unit_id,
      sku_base_unit_name: skuBaseUnit.name,
      second_base_unit_name: skuSecondUnit,
      units: sku?.units,
      sku_base_unit_id: sku?.base_unit_id,
      stock_num: shelf_stock.stock?.base_unit?.quantity,
      stock_money: shelf_stock.stock?.base_unit?.price,
    }
  })
}
