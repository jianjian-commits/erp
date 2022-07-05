/*
 * @Description: ssu相关
 */
import Big from 'big.js'
import { Sku, Ssu } from 'gm_api/src/merchandise'
import _ from 'lodash'
import globalStore from '@/stores/global'
import { OrderDetail } from 'gm_api/src/order'

interface ParseSsuRerult {
  /** ssu 基本单位 系统单位 */
  ssu_base_unit_id?: string
  /** ssu 基本单位名 */
  ssu_base_unit_name: string
  /** ssu 计量单位 系统单位 */
  ssu_unit_parent_id: string
  /** ssu 计量单位名 */
  ssu_unit_parent_name: string
  /** ssu 包装单位 */
  ssu_unit_name: string
  /** 比例 计量单位/包装单位 */
  ssu_unit_rate: number
  /** 比例 计量单位/基本单位 */
  ssu_base_unit_rate: number
  /** 比例 基本单位/包装单位 */
  ssu_sale_rate: number
  /** 出库单位 */
  outstock_unit_name?: string
  /** 出库单位id */
  outstock_unit_id?: string
  /** 定价单位 */
  fee_unit_name?: string
  /** 定价单位id */
  fee_unit_id?: string
  unit_id?: string
}
export const parseSsu = (
  ssu: Pick<Ssu, 'base_unit_id' | 'unit'>,
): Partial<ParseSsuRerult> => {
  if (_.isEmpty(ssu)) {
    return {}
  }
  const ssuBaseUnit = globalStore.getUnit(ssu?.base_unit_id!)
  const ssuUnitParent = globalStore.getUnit(ssu?.unit?.parent_id)
  const ssu_base_unit_rate = +Big(ssuUnitParent?.rate || 0).div(
    ssuBaseUnit?.rate || 1,
  )
  return {
    ssu_base_unit_id: ssuBaseUnit?.value, // ssu 基本单位 系统单位
    ssu_base_unit_name: ssuBaseUnit?.text!, // ssu 基本单位名
    ssu_unit_parent_id: ssuUnitParent?.value!, // ssu 计量单位 系统单位
    ssu_unit_parent_name: ssuUnitParent?.text!, // ssu 计量单位名
    ssu_unit_name: ssu?.unit?.name!, // ssu 包装单位
    ssu_unit_rate: +ssu?.unit.rate!, // 比例 计量单位/包装单位
    ssu_base_unit_rate, // 比例 计量单位/基本单位
    ssu_sale_rate: +Big(+ssu?.unit.rate!)
      .times(ssu_base_unit_rate)
      .toString(), // 比例 基本单位/包装单位
  }
}

export const parseSku = (orderDetail: OrderDetail): Partial<ParseSsuRerult> => {
  if (_.isEmpty(orderDetail)) {
    return {}
  }
  const unit_id = orderDetail?.unit_id!
  const unitList = orderDetail?.unit_cal_info?.unit_lists || []
  const baseUnit = _.find(unitList, (unit) => unit.unit_id === unit_id)
  const parent_id = baseUnit?.parent_id
  const parentUnit = _.find(unitList, (unit) => unit.unit_id === parent_id)
  const ssu_base_unit_rate = +baseUnit?.rate!
  const outstock_unit_id =
    orderDetail?.outstock_unit_value_v2?.quantity?.unit_id
  const outstockUnit = _.find(
    unitList,
    (unit) => unit.unit_id === outstock_unit_id,
  )

  const feeUnitName =
    unit_id === orderDetail?.fee_unit_id
      ? _.find(unitList, (unit) => unit.unit_id === unit_id)?.name
      : globalStore.getUnitName(orderDetail.fee_unit_id!)

  return {
    ssu_base_unit_id: baseUnit?.unit_id, // ssu 基本单位 系统单位
    ssu_base_unit_name: baseUnit?.name!, // ssu 基本单位名
    ssu_unit_parent_id: parentUnit?.unit_id!, // ssu 计量单位 系统单位
    ssu_unit_parent_name: parentUnit?.name!, // ssu 计量单位名
    ssu_unit_name: baseUnit?.name!, // ssu 包装单位
    ssu_unit_rate: +baseUnit?.rate!, // 比例 计量单位/包装单位
    ssu_base_unit_rate, // 比例 计量单位/基本单位
    ssu_sale_rate: +baseUnit?.rate!,
    outstock_unit_name: outstockUnit?.name!, // 出库单位
    outstock_unit_id: outstock_unit_id /** 出库单位id */,
    fee_unit_name: feeUnitName, // 定价单位
    unit_id,
    fee_unit_id: orderDetail?.fee_unit_id /** 定价单位id */,
  }
}
