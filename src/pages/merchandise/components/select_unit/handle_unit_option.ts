import _ from 'lodash'
import globalStore from '@/stores/global'
import {
  UNIT_ENUM,
  UNIT_ENUM_TYPE,
  getUnitEnumMean,
} from '@/pages/merchandise/price_manage/customer_quotation/constants'
import { UnitOptions } from '@/pages/merchandise/price_manage/customer_quotation/data'
import { Unit_Type } from 'gm_api/src/merchandise'

interface CustomizeSortOptions<T = Unit_Type> {
  /** 排序顺序 */
  orderRule: T[]
  /**
   * 设置为 true 则将剩余未匹配到的单位类型放置于最后
   * 设置为 falsy 则忽略未匹配到的单位类型
   *
   * @default true
   */
  trailing?: boolean
}

function getUnitType(unitId: string) {
  const target = globalStore.unitMap[unitId]
  return target?.type
}

/**
 * 根据 Unit_Type 转 map
 */
function groupByUnitType(list?: UnitOptions[]) {
  const result: Partial<Record<Unit_Type, UnitOptions[]>> = _.groupBy(
    list,
    (item) => getUnitType(item.value),
  )
  return result
}

/**
 * 根据 unit 转 map
 */
function groupByUnitEnum(value?: UnitOptions[]) {
  const result: Partial<Record<UNIT_ENUM_TYPE, UnitOptions[]>> = _.groupBy(
    value,
    (item) => item.unit,
  )
  return result
}

/**
 * 类型排序（重量单位 > 容积单位 > 长度单位 > 其他单位）
 */
function orderByUnitType(
  value?: UnitOptions[],
  options?: CustomizeSortOptions,
) {
  const { orderRule = [], trailing = true } = options || {}
  const result: UnitOptions[] = []
  const mapping = groupByUnitType(value)
  const typeOrder: (Unit_Type | string)[] = orderRule
  if (trailing) {
    typeOrder.push(..._.keys(_.omit(mapping, typeOrder)))
  }
  _.forEach(typeOrder, (item) => {
    result.push(...(_.get(mapping, item) || []))
  })
  return result
}

/**
 * 根据 Unit_Type 排序
 */
function orderUnitMap(
  value?: Partial<Record<number, UnitOptions[]>>,
  options?: CustomizeSortOptions,
) {
  const result: Partial<Record<number, UnitOptions[]>> = _.mapValues(
    value,
    (item, type): UnitOptions[] => {
      // 自定义单位暂不参与排序
      if (type === `${UNIT_ENUM.custom_unit}`) {
        return item || []
      }
      return orderByUnitType(item, options) || []
    },
  )
  return result
}

type Rule = (string | string[] | UNIT_ENUM_TYPE | UNIT_ENUM_TYPE[])[]
interface HandleOrderRuleParams {
  /**
   * 所有的 key
   */
  allKey: string[]
  /**
   * 已选择的
   */
  rule: (UNIT_ENUM_TYPE | UNIT_ENUM_TYPE[])[]
  /**
   * 是否将 allKey 与 rule 合并
   *
   * @default true
   */
  shouldMerge?: boolean
}

/**
 * 合并排序规则
 */
function handleOrderRule(params: HandleOrderRuleParams): Rule {
  const { shouldMerge = true, rule, allKey } = params
  if (!shouldMerge) {
    return rule
  }
  const mergedRule: Rule = [...rule]
  const other = _.xorWith(
    _.flattenDeep(rule).map((item) => `${item}`),
    allKey,
  )
  mergedRule.push(...other)
  return mergedRule
}

const orderUnitOptionBy = (
  unitMap: Partial<Record<number, UnitOptions[]>>,
  options?: CustomizeSortOptions<UNIT_ENUM_TYPE | UNIT_ENUM_TYPE[]>,
) => {
  const { orderRule: rule, trailing } = options || {}
  const result: { label: string; children: UnitOptions[] }[] = []

  const orderRule = handleOrderRule({
    rule: rule || [],
    allKey: _.keys(unitMap),
    shouldMerge: trailing,
  })
  _.forEach(orderRule, (item) => {
    if (_.isArray(item)) {
      const list: UnitOptions[] = []
      const label = getUnitEnumMean(item[0])
      if (!label) {
        return
      }
      item.forEach((v) => {
        list.push(...(_.get(unitMap, v) || []))
      })
      result.push({
        label,
        children: list,
      })
    } else {
      result.push({
        label: getUnitEnumMean(item) || '',
        children: _.get(unitMap, item) || [],
      })
    }
  })
  return _.filter(result, (item) => !_.isEmpty(item.children))
}

/**
 * unit 分组排序
 * 分组：基本单位、辅助单位、自定义单位
 * 排序：重量单位 > 容积单位 > 长度单位 > 其他单位
 */
function unitGroupAndOrder(value?: UnitOptions[]) {
  const groupedByUnit = orderUnitMap(groupByUnitEnum(value), {
    orderRule: [Unit_Type.MASS, Unit_Type.VOLUME, Unit_Type.LENGTH],
  })
  return orderUnitOptionBy(groupedByUnit, {
    orderRule: [
      [UNIT_ENUM.base_unit, UNIT_ENUM.same_base_unit],
      [UNIT_ENUM.assist_unit, UNIT_ENUM.same_assist_unit],
      UNIT_ENUM.custom_unit,
    ],
  })
}

export default unitGroupAndOrder
