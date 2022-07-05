import React, { useEffect, useRef, useState, VFC } from 'react'
import { Select, SelectProps } from 'antd'
import { reaction } from 'mobx'
import globalStore from '@/stores/global'
import { groupByUnitType, orderUnitByType } from '@/common/util'
import { Unit, Unit_Type } from 'gm_api/src/merchandise'
import _ from 'lodash'
import { observer } from 'mobx-react'
import { pinyin } from '@gm-common/tool'

const { Option } = Select

type SelectUnitProps = Omit<SelectProps, 'options' | 'children'> & {
  /**
   * 根据 Unit 类型排序。
   *
   * 此 Prop 变化不触发更新
   *
   * @default [Unit_Type.MASS, Unit_Type.VOLUME, Unit_Type.LENGTH]
   */
  orderByType?: Unit_Type[]
}

const DEFAULT_ORDER_BY_TYPE = [
  Unit_Type.MASS,
  Unit_Type.VOLUME,
  Unit_Type.LENGTH,
]

/** 选择基本单位下拉框 */
const SelectBasicUnit: VFC<SelectUnitProps> = observer((props) => {
  const { fieldNames, orderByType = DEFAULT_ORDER_BY_TYPE, ...rest } = props
  const { label = 'name', value = 'unit_id' } = fieldNames || {}
  const [options, setOptions] = useState<Unit[]>()

  // 缓存 orderByType，防止该值频繁变化
  const orderByTypeRule = useRef(orderByType)

  useEffect(() => {
    reaction(
      () => globalStore.unitList,
      (val) => {
        setOptions(
          orderUnitByType(groupByUnitType(val), {
            // 排序
            typeOrder: orderByTypeRule.current,
          }),
        )
      },
      { fireImmediately: true },
    )
  }, [])

  return (
    <Select
      optionFilterProp='children'
      filterOption={(input: string, option: any) => {
        const text = input.toLocaleLowerCase()
        return (
          option!.children.indexOf(text) >= 0 ||
          pinyin(option!.children).indexOf(text) >= 0
        )
      }}
      {...rest}
    >
      {_.map(options, (item) => {
        return (
          <Option key={item.unit_id} value={_.get(item, value)}>
            {_.get(item, label)}
          </Option>
        )
      })}
    </Select>
  )
})
SelectBasicUnit.displayName = 'SelectBasicUnit'

export default SelectBasicUnit
