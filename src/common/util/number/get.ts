/*
 * @Description: 获取小数 util
 */
import Big from 'big.js'

/**
 * @description: 获取小数位数
 */
export const getDecimalAmount = (num: Big | number): number =>
  num.toString().split('.')[1]?.length
