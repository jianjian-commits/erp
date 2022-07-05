/** 古老的util.tsx文件太大个
 * 且存在爆红比较多，引起编译慢
 * so另起一个util文件
 */
import Big from 'big.js'
import _ from 'lodash'
import type { CategoryInfo, Sku, Unit } from 'gm_api/src/merchandise/types'
import globalStore from '@/stores/global'
import type { SortItem } from '@/common/interface'

import { PAY_STATUS } from './enum'
import { getEnumText } from '@/common/util'
import { TreeListItem } from '@gm-pc/react'
import {
  ObjectOfKey,
  SalesInvoicingSheet,
} from '@/pages/sales_invoicing/interface'

import { PayStatus, Shelf } from 'gm_api/src/inventory/types'

interface CustomUnit extends Unit {
  unit_id: string
  converted_rate: number
}

/**
 * 排序：将自定义单位排序, 根据 rate 倒序,  id 正序排序 即 rate 越大越前, id越小越前 上面例子里的 顺序是  :  箱,袋,框
 * 箱 和 袋 的rate 最大, 放在最前面, 然后因为 箱的id更小, 所以 箱放在第一个,  袋放在第二个, 框的rate 最小放最后
 * @param units
 * @returns 返回一个新的units
 */
const unitsSort = (units: CustomUnit[]) => {
  return _.orderBy(units, ['converted_rate', 'unit_id'], ['desc', 'asc'])
}

/**
 *
 */
const customUnit2BaseUnit = (
  targetUnit: Unit,
  base_unit_id: string,
): CustomUnit => {
  const { parent_id } = targetUnit
  const targetBaseUnit =
    parent_id === '0' ? targetUnit : globalStore.getUnit(parent_id)
  const baseUnitInfo = globalStore.getUnit(base_unit_id)
  const convertTimes = +Big(_.toNumber(targetBaseUnit?.rate)).div(
    _.toNumber(baseUnitInfo?.rate),
  )

  return {
    ...targetUnit,
    converted_rate: +Big(_.toNumber(targetUnit?.rate)).times(convertTimes),
  }
}

/**
 * 商品多单位换算，大单位化小单位
 * @param total 基本单位的总数量
 * @param unit 当前自定义单位的信息
 * @returns 类似于"11袋10斤"的字符串
 */
export const mutiUnitConvert = (
  total: string | number,
  units: Unit[],
  sku_base_unit_id: string,
): string => {
  let totalBase = _.toNumber(total)
  /** 基本单位的信息 */
  const baseUnitInfo = globalStore.getUnit(sku_base_unit_id)

  if (!totalBase) return `${_.toNumber(total).toFixed(4)}${baseUnitInfo.name}`

  const toBaseUnits = _.map([...units, baseUnitInfo], (unit) =>
    customUnit2BaseUnit(unit, sku_base_unit_id),
  )
  // 简单转换一下类型之后再做排序
  const convertedUnits = _.map(toBaseUnits, (unit) => {
    return {
      ...unit,
      unit_id: _.toNumber(unit.unit_id),
    }
  })

  let resStr = ''
  /** 排序后的units */
  const _units = unitsSort(convertedUnits)
  /** 最后一个小单位 */
  const lastUnitInfo = _units[_units.length - 1]

  // 遍历拼接最前面三个大单位，第四个小单位作为余数进行拼接
  for (const [index, unitItem] of _units.entries()) {
    if (index === _units.length - 1) break

    const { name, converted_rate } = unitItem
    // 化大单位的倍数
    const timesNum = Math.floor(totalBase / (converted_rate || 1))
    totalBase = totalBase % converted_rate

    if (timesNum === 0) continue

    resStr += `${timesNum}${name}`
  }

  // 处理最后的余数
  if (totalBase > 0) {
    const { name, converted_rate } = lastUnitInfo
    const lastUnitCount = totalBase / (converted_rate || 1)
    resStr += `${_.toNumber(lastUnitCount.toFixed(2))}${name}`
  }

  return resStr
}

export const getCategoryName = (categoryMap: CategoryInfo, sku: Sku) => {
  // category1_id
  const category_name = Array(5)
  for (let i = 1; i <= 5; i++) {
    const key = `category${i}_id` as keyof Sku
    const id = sku?.[key]
    category_name[i - 1] =
      categoryMap?.[id]?.category_name || categoryMap?.[id]?.name
  }
  return category_name.filter(Boolean).join('/')
}

export const getRuleList = ({ sort_by, sort_direction }: SortItem) => {
  if (!sort_direction) return []

  return [{ sort_by: sort_by, sort_direction }]
}

/**
 * 获取支付状态值
 * @param pay_status 状态
 * @returns
 */
export const handlePayStatus = (pay_status: PayStatus) => {
  const result: { name: string; value?: PayStatus[] } = {
    name: '',
    value: undefined,
  }

  if (
    pay_status === PayStatus.PAY_STATUS_NOT_PAID ||
    pay_status === PayStatus.PAY_STATUS_READY_TO_PAY
  ) {
    result.name = getEnumText(PAY_STATUS, PayStatus.PAY_STATUS_NOT_PAID)
    result.value = [
      PayStatus.PAY_STATUS_NOT_PAID,
      PayStatus.PAY_STATUS_READY_TO_PAY,
    ]
  } else if (pay_status === PayStatus.PAY_STATUS_UNSPECIFIED) {
    result.value = undefined
    result.name = getEnumText(PAY_STATUS, pay_status)
  } else {
    result.name = getEnumText(PAY_STATUS, pay_status)
    result.value = [pay_status]
  }

  return result
}

/** 把对象的所有数字值转换成字符串 */
export const converNum2StringOfObj = (obj: Record<string, any>) => {
  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'number') {
      obj[key] = value.toString()
    }
    if (value === '') {
      obj[key] = undefined
    }
    if (_.isObject(value)) {
      converNum2StringOfObj(value)
    }
  }

  return obj
}

/**
 * 根据货位id获取货位选择数组
 * @param {Shelf[]} data 平铺的object，内自带parent_id
 * @param {string} shelfId 货位id
 */
export const getShelfSelected = (data: Shelf[], shelfId?: string) => {
  const result: string[] = []
  let levelShelfId = shelfId
  const idMap: ObjectOfKey<any> = {}

  _.each(data, (item) => {
    idMap[item.shelf_id] = {
      ...item,
      value: item.shelf_id,
      text: item.name,
      parent_id: item.parent_id,
    }
  })

  // 存在货位不填的情况，因此需要对货位未选择做校验
  if (levelShelfId && idMap[levelShelfId]) {
    result.unshift(levelShelfId)
    while (
      idMap[levelShelfId!]?.parent_id &&
      idMap[levelShelfId!]?.parent_id !== '0'
    ) {
      result.unshift(idMap[levelShelfId!].parent_id!)
      levelShelfId = idMap[levelShelfId!].parent_id
    }
  }
  return result
}

/** TODO: 商品分类树状数据 */
export const getCategoryProductTree = (
  data: SalesInvoicingSheet.ProductDetail[],
) => {
  const treeData: TreeListItem[] = []
  const category1 = new Map()

  for (const [index, item] of data.entries()) {
    const n = index + 1
    const base_id = `category_id_${n}`
    const base_name = `category_name_${n}`

    // 如果有相同category_id，则合并children
    if (category1.has(item?.[base_id])) {
    }
  }
}
