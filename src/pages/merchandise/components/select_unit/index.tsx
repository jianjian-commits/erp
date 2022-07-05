import React, { useMemo, VFC } from 'react'
import {
  SelectGroupingUnit,
  SelectGroupingUnitProps,
} from '@/common/components/select_unit'
import { UnitOptions } from '@/pages/merchandise/price_manage/customer_quotation/data'
import unitGroupAndOrder from './handle_unit_option'

type SelectUnitProps = Omit<
  SelectGroupingUnitProps<UnitOptions['value']>,
  'options'
> & {
  options?: UnitOptions[]
}

/**
 * 单位选择器 - 单位按组分类/排序
 */
const SelectUnit: VFC<SelectUnitProps> = (props) => {
  const { options, ...rest } = props

  const opt = useMemo(() => {
    return unitGroupAndOrder(options)
  }, [options])

  return <SelectGroupingUnit {...rest} options={opt} />
}

export default SelectUnit
