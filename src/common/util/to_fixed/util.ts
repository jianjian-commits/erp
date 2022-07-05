/*
 * @Description:不确定或公共toFixed的util放这里
 */
import globalStore from '@/stores/global'
import Big from 'big.js'
import _ from 'lodash'
import type { PrecisionMapKeyType, PrecisionMapType } from '@/common/interface'

export const precisionMap: PrecisionMapType = {
  salesInvoicing: globalStore.dpSalesInvoicing,
  dpInventoryAmount: globalStore.dpInventoryAmount,
  dpSupplierSettle: globalStore.dpSupplierSettle,
  order: globalStore.dpOrder,
  common: globalStore.dp,
}
export const toFixed = (b: Big | number, dp?: number) => {
  if (typeof b !== 'number' && !b) return '-'
  return Big(b).toFixed(dp || globalStore.dp)
}

export const toFixedOrder = (b: Big | number | string) => {
  // b为NaN会导致报错
  if (b === '-' || Number.isNaN(b)) {
    return '-'
  }

  return toFixed(Big(b), globalStore.dpOrder)
}

/**
 * @description: 进销存小数点位数控制
 */
export const toFixedSalesInvoicing = (b: Big | number) => {
  if (_.isNil(b)) return ''
  return toFixed(b, globalStore.dpSalesInvoicing)
}

// 小数点位数控制，由于太多了，就统一管理吧
export const toFixedByType = (b: Big | number, type?: PrecisionMapKeyType) => {
  return toFixed(b, _.isNil(type) ? precisionMap.common : precisionMap[type])
}
