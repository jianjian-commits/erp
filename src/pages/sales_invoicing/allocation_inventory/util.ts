import globalStore from '@/stores/global'
import _ from 'lodash'
import { UnitValue } from 'gm_api/src/merchandise'
import Big from 'big.js'

type Collection<T> = T extends infer P ? P : T

export function getInfoByArgs<T>(collection: Collection<T>, props: string) {
  const result = (collection && collection?.[props]) || {}
  return result
}

/**
 * 调拨损耗页面获取 出入库数量（计量或包装单位(废弃)）
 * @param input
 * @param unitId
 * @returns 出入库数量（计量或包装单位(废弃)）
 */
export const getInputNumOrUnit = (input: UnitValue): string => {
  const quantity = input?.quantity ?? '0'
  const unitName = globalStore.getUnitName(input?.unit_id)

  return Big(+quantity).toFixed(4) + unitName
}

export const isSharing = (
  skuUnits: { sku_id: string; unit_id: string }[],
  skuId: string,
) => {
  return _.find(skuUnits, (item) => item.sku_id === skuId)
}
