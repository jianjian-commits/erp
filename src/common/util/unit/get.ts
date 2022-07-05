/*
 * @Description: 获取unit相关util
 */
import globalStore from '@/stores/global'

/**
 * @description: 系统单位换算计量单位
 * @param {string} parentUnitId 计量单位
 * @param {string} systemUnitId 系统单位
 * @return {number} parentUnitRate / systemUnitRate
 */
export const getBaseRateFromBaseUnit = (
  parentUnitId: string, // 计量单位
  systemUnitId: string, // 系统单位
) => {
  const parentUnitRate = +globalStore.getUnit(parentUnitId).rate
  const systemUnitRate = +globalStore.getUnit(systemUnitId).rate
  return parentUnitRate / systemUnitRate
}
