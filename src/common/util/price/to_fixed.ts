/*
 * @Description: 金额保留小数位数util
 */
import { toFixedOrder } from '@/common/util'
import { Price } from '@gm-pc/react'
import Big, { BigSource } from 'big.js'
/**
 * @description: 订单保留小数位
 */
export const toFixOrderWithPrice = (b: BigSource = 0) => {
  if (typeof b === 'string') {
    // 如果b是-字符，直接返回
    if (b === '-') {
      return b
    }
    b = +b
  }
  return toFixedOrder(b) + Price.getUnit()
}
