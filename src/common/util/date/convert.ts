/*
 * @Description: 日期转换util
 */
import moment from 'moment'
import { dayMM } from '@/common/util'

/**
 * @description: 毫秒数 => Date
 * @param {number} ms 毫秒数
 * @param {boolean} isMinusDayMM 是否减去dayMM
 * @return {Date} new Date
 */
export const MToDate = (ms: number | string, isMinusDayMM = true) => {
  if (typeof ms === 'string') ms = Number(ms)
  if (ms > dayMM && isMinusDayMM) {
    ms = ms - dayMM
  }
  const mm = +moment().startOf('day').format('x') + ms
  return new Date(mm)
}
/**
 * @description: Date => 毫秒数
 * @param {Date} d
 * @return {string} 毫秒数
 */
export const dateTMM = (d: Date | string | number) => {
  return `${+moment(d).format('x') - +moment(d).startOf('day').format('x')}`
}
