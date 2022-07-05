import { list2MapSeveralKey } from '@/common/util'
import { UnitOptions } from '@/pages/merchandise/price_manage/customer_quotation/data'
import { getUnitGroupList } from '@/pages/merchandise/util'
import { Sku } from '@/pages/order/order_manage/components/interface'
import { Unit } from 'gm_api/src/merchandise'
import _ from 'lodash'
import { ReactNode } from 'react'

interface CustomizeUnit extends Omit<Unit, 'name'> {
  value: string
  text: ReactNode
  name: ReactNode
}

export type UnitShape = UnitOptions | CustomizeUnit

export default function createUnitList(sku?: Sku): UnitShape[] {
  if (_.isNil(sku)) {
    return []
  }
  const unitMap = list2MapSeveralKey(sku?.units?.units!, ['unit_id'])
  const unitList = getUnitGroupList(sku)

  return unitList.map((item) => {
    const isCustom = _.has(unitMap, item.value)
    return {
      ...(isCustom ? unitMap[item.value] : undefined),
      value: item.value,
      text: item.label,
      name: item.label,
    } as UnitShape
  })
}
