import { Unit, Unit_Type } from 'gm_api/src/merchandise'
import _ from 'lodash'

/**
 * Unit 按 Unit_Type 分组
 */
function groupByUnitType(rawData?: Unit[]) {
  const result: Partial<Record<Unit_Type, Unit[]>> = _.groupBy(
    rawData,
    (item) => item.type,
  )
  return result
}

export default groupByUnitType
