import { Select, SelectProps } from 'antd'
import _ from 'lodash'
import React, { ReactElement } from 'react'

const { OptGroup, Option } = Select

export type SelectGroupingUnitProps<ValueType> = Omit<
  SelectProps<ValueType>,
  'options' | 'fieldNames'
> & {
  options?: unknown
  fieldNames?: {
    /** @default "label" */
    groupLabel?: string
    /** @default "label" */
    label?: string
    /** @default "value" */
    value?: string
    /** @default "children" */
    children?: string
  }
}

export type GroupedUnit = {
  label: string
  value: string | number
  children: { label: string; value: string | number }[]
}

interface SelectGroupingUnitComponent {
  <ValueType = any>(props: SelectGroupingUnitProps<ValueType>): ReactElement
}

/**
 * 单位选择器（分组显示）
 */
const SelectGroupingUnit: SelectGroupingUnitComponent = (props) => {
  const { options, fieldNames, ...rest } = props
  const {
    label = 'label',
    value = 'value',
    children = 'children',
    groupLabel = 'label',
  } = fieldNames || {}

  const groupName = groupLabel || label

  return (
    <Select {...rest}>
      {_.isArray(options) &&
        _.map(options, (item) => {
          if (!_.isPlainObject(item)) {
            return null
          }
          const list = item[children] || []
          return (
            <OptGroup key={`${item[label]}`} label={item[groupName]}>
              {_.map(list, (child, index) => (
                <Option key={child[value] || index} value={child[value]}>
                  {child[label]}
                </Option>
              ))}
            </OptGroup>
          )
        })}
    </Select>
  )
}

export default SelectGroupingUnit
