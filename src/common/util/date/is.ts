/**
 * @description: 校验日期相关，以is开头
 */
import _ from 'lodash'
import { dayMM } from '@/common/util'

/**
 * @description: 是否第二天
 * @param {string} value
 * @return {boolean}
 */
export const isSecondDay = (value: string | number) => {
  if (_.isString(value)) {
    value = +value
  }
  return value >= dayMM
}
/**
 * @description: 差值是否小于1天的MM,后端要求两个差值小于1天的MM
 * @param {string} max 最大值，如order_receive_max_time
 * @param {string} min 最小值 如order_receive_min_time
 */
export function isDiffLessOneDayMM(max: string | number, min: string | number) {
  if (typeof max === 'string') max = +max
  if (typeof min === 'string') min = +min

  if (max - min < dayMM) return true
  return false
}
/**
 * @description: 是否等于一天的mm减一(86400000 - 1 = 86399999), 后端返回86399999，而前端要显示86400000，故这里判断一下
 */
export function isEqualOneDayMM_1(mm: string | number) {
  if (typeof mm === 'string') mm = +mm
  return mm === dayMM - 1
}
