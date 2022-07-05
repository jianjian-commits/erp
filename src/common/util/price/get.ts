/*
 * @Description: 获取金额util
 */
import { toFixedOrder } from '@/common/util'
import Big from 'big.js'
/**
 * @description: 金额太长会加上...
 * @param {Big} b 金额
 * @param {boolean} isNoRounding 是否不保留位数
 * @return {string} 处理后的金额，太长会加上...
 */
export const getEndlessPrice = (b: Big, isNoRounding?: boolean): string => {
  const _b = Number(b).toString().split('.')
  const del = _b[1] || ''

  if (isNoRounding) {
    const first = _b[0]
    const second = _b[1]?.substr(0, 6) || ''
    if (!second) {
      return first
    }

    if (second.length === 6) {
      return first + '.' + second + '...'
    }

    return first + '.' + second
  }

  if (del.length > 6) {
    // toFixed方法有一些四舍五入的情况
    return `${_b[0] + '.' + del.slice(0, 6)}...`
  }
  return toFixedOrder(b).toString()
}
