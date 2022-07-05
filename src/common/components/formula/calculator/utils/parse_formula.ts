import _ from 'lodash'
import { FULL_CALC_BTN_LIST } from '../constant'
import { CalcBtnConfig } from '../types'

/**
 * 解析字符串公式（解析为数组）
 */
export default function parseFormula(str?: string) {
  const val = _.trim(str)
  const list = FULL_CALC_BTN_LIST.filter((item) => {
    return val.includes(item.value)
  })
  const result: CalcBtnConfig[] = []
  list.forEach((item) => {
    let index = val.indexOf(item.value) // 查找当前字符串实际出现位置
    while (index !== -1) {
      result[index] = item
      index = val.indexOf(item.value, index + 1) // 找到则继续下一位开始找
    }
  })
  return result.filter((v) => !_.isNil(v))
}
