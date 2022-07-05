/*
 * @Description:不确定或公共check的util放这里
 */
import Big from 'big.js'
import { GroupUser_Type } from 'gm_api/src/enterprise'
import _ from 'lodash'

export const isValid = (val: any) =>
  val !== undefined && val !== null && _.trim(val) !== ''

/**
 * @description: 经纬度 同时0 或者 同时null,视为无效坐标点
 */
export const isInvalidLocation = (lat: any, lng: any) => !lat && !lng

//
/**
 * @description: 是否为数字，英文组合
 */
export function isNumOrEnglish(input: string | number | null | undefined) {
  return /^[a-zA-Z0-9]+$/.test(input + '')
}
/**
 * @description: 判断当前计算数值为小数后几位，对应展示
 *              无穷尽小数：取6位展示 + ...，否则正常展示即可
 */
export const isEndless = (b: Big): boolean => {
  const _b = b.toString().split('.')
  const del = _b[1] || ''
  if (del.length > 6) return true
  return false
}
/**
 * @description: 是否是生产环境
 */
export const isProduction = location.host === 'x.guanmai.cn'
/**
 * @description: 是否是admin管理员账号
 */
export function isAdmin(type: GroupUser_Type) {
  return type === GroupUser_Type.GROUP_ADMIN
}
