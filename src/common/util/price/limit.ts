/*
 * @Description:限制金额位数相关
 */
import Big from 'big.js'
import { toFixed, getDecimalAmount } from '@/common/util'

/**
 * @description: 限制小数最大八位
 */
export const limitPriceDecimal = (price: number) => {
  if (getDecimalAmount(price) > 8) return toFixed(Big(price), 8)
  return price
}
