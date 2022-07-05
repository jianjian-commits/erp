/*
 * @Description: unit相关转换的util
 */

import Big from 'big.js'
import {
  UnitValue,
  Unit,
  ListBasicPriceV2Response,
  ListBestSaleSkuResponse,
} from 'gm_api/src/merchandise'
import globalStore from '@/stores/global'
import { observable } from 'mobx'
import { ListOrderDetail, ListOrderDetailResponse } from 'gm_api/src/order'

/**
 * 转换指定unitValue到另一个同类单元
 *
 * 升 - rate:1 parent:null
 *
 * 毫升 - rate: 0.001 parent: 升
 *
 * 克 - rate:1 parent:null
 *
 * 斤 - rate:500, parent: 克
 *
 * S1: x元/毫升→y元/升，y=x/毫克.rate*升.比 (p2c)
 *
 *     x元/升→y元/毫升，y=x*升.比*毫升.比 (c2p)
 *
 * S2: x元/克→y元/斤，y=x*斤.rate*斤.比 (p2c)
 *
 *     x元/斤→y元/克，y=x/斤.rate*克.比 (c2p)
 *
 * 注意
 * pure为false时，是转元/unit，不是转unit，结果会不一样
 */
export function convertUnit(
  from: UnitValue,
  to: Unit | string,
  pure = false,
): UnitValue {
  let fromUnit
  let toUnit
  let fTop
  let toIsPackUnit = false
  let result = {} as UnitValue

  const getUnit = (unitId: string) => globalStore.getUnit(unitId)
  // || globalStore.knownUnits.find((u) => u.unit_id === unitId)

  if (typeof to === 'string') {
    to = getUnit(to)
  }

  if (+from.unit_id <= 100) {
    // ↓ from不能是包装单位
    throw new Error('`from` can not be package unit')
  } else if (+from.unit_id > 100 && +from.unit_id < 1000) {
    // ↓ 处理自定义单位
    fromUnit = getUnit(from.unit_id)
    if (!fromUnit) {
      console.error('[convertUnit] 未找到单位', from.unit_id)
      return { unit_id: '' }
    }
    from = {
      ...from,
      unit_id: fromUnit.parent_id,
      val: Big(from.val || 0)
        .div(fromUnit.rate)
        .toString(),
    }
    fromUnit = getUnit(from.unit_id)
  } else {
    fromUnit = getUnit(from.unit_id)
  }
  // ↑

  // ↓ to如是包装单位，转计量单位
  if (+to.unit_id < 100) {
    toIsPackUnit = true
    toUnit = getUnit(to.parent_id)
  } else if (+to.unit_id > 100 && +to.unit_id < 1000) {
    // 自定义单位做包装单位处理
    toIsPackUnit = true
    toUnit = getUnit(to.parent_id)
  } else {
    toUnit = to
  }
  // ↑

  // ↓ 取from的顶层单位
  if (fromUnit.parent_id !== '0') {
    fTop = getUnit(fromUnit.parent_id)
  } else {
    fTop = fromUnit
  }
  // ↑

  // ↓ 情况零，互转的单位相同
  if (fromUnit.unit_id === toUnit.unit_id) {
    result = from
  }
  // ↑

  // ↓ 情况一，顶层单位转下层单位（p2c）
  if (fromUnit.parent_id === '0' && toUnit.parent_id !== '0') {
    let val = Big(from.val || 0)
      .times(fromUnit.rate)
      .times(toUnit.rate)
      .toString()
    if (pure) {
      val = Big(from.val || 0)
        .times(fromUnit.rate)
        .div(toUnit.rate)
        .toString()
    }
    result = {
      ...from,
      unit_id: toUnit.unit_id,
      val,
    }
  }
  // ↑

  // ↓ 情况二，下层单位转顶层单位(c2p)
  else if (fromUnit.parent_id !== '0' && toUnit.parent_id === '0') {
    let val = Big(from.val || 0)
      .div(fromUnit.rate)
      .times(toUnit.rate)
      .toString()
    if (pure) {
      val = Big(from.val || 0)
        .times(fromUnit.rate)
        .times(toUnit.rate)
        .toString()
    }
    result = {
      ...from,
      unit_id: fTop.unit_id,
      val,
    }
  }
  // ↑

  // ↓ 情况三，下层单位转另一个下层单位(c2p+p2c)
  else if (fromUnit.parent_id !== '0' && toUnit.parent_id !== '0') {
    let val = Big(from.val || 0)
      .div(fromUnit.rate)
      .times(fTop.rate)
      .times(toUnit.rate)
      .toString()
    if (pure) {
      val = Big(from.val || 0)
        .times(fromUnit.rate)
        .times(fTop.rate)
        .div(toUnit.rate)
        .toString()
    }
    result = {
      ...from,
      unit_id: toUnit.unit_id,
      val,
    }
  }
  // ↑

  // ↓ 转回包装单位
  if (!result.unit_id && toIsPackUnit) {
    result = {
      ...result,
      unit_id: to.unit_id,
      val: Big(result.val || 0)
        ?.[pure ? 'div' : 'times'](to.rate)
        .toString(),
    }
  }
  // ↑

  return result
}
