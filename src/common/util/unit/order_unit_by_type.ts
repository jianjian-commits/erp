import { Unit, Unit_Type } from 'gm_api/src/merchandise'
import _ from 'lodash'

interface CustomizeSortOptions {
  /**
   * 类型排序顺序
   */
  typeOrder: Unit_Type[]
  /**
   * 设置为 true 则将剩余未匹配到的单位类型放置于最后
   * 设置为 falsy 则忽略未匹配到的单位类型
   *
   * @default true
   */
  trailing?: boolean
}

/**
 * 根据单位类型排序
 *
 * `options.typeOrder` 类型排序顺序
 *
 * `options.trailing` (默认为 true) 设置为 true 则将剩余未匹配到的单位类型放置于最后
 */
const orderUnitByType = (
  unitTypedMap: Partial<Record<Unit_Type, Unit[]>>,
  options?: CustomizeSortOptions,
) => {
  const { typeOrder = [], trailing = true } = options || {}
  const result: Unit[] = []
  const orderRule = typeOrder.map((item) => `${item}`)
  if (trailing) {
    const other = _.xorWith(orderRule, _.keys(unitTypedMap), (val1, val2) => {
      return `${val1}` === `${val2}`
    })
    orderRule.push(...other)
  }
  _.forEach(orderRule, (item) => {
    result.push(...(_.get(unitTypedMap, item) || []))
  })
  return result
}

export default orderUnitByType
