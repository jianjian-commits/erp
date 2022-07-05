/**
 * @description 新建商品-基本信息-多单位管理-单位item
 */
import React, { FC } from 'react'
import { observer } from 'mobx-react'
import { toJS } from 'mobx'
import { Space, Form, Input, Select, InputNumber } from 'antd'
import _ from 'lodash'
import {
  UnitConversionItem,
  UnitConversionProps,
} from '@/pages/merchandise/manage/merchandise_list/create/type'

const { Option } = Select

const UnitConversion: FC<UnitConversionProps> = observer((props) => {
  const { front, end } = props

  const getAfterNode = (data: UnitConversionItem) => {
    const { afterType, afterDisabled } = data
    if (!afterType) return ''

    const dom =
      afterType === 'select' ? (
        <Select style={{ width: 80 }} disabled={afterDisabled}>
          {_.map(data.selectList, (unitItem) => {
            const { value, text } = unitItem
            return (
              <Option key={value} value={value}>
                {text}
              </Option>
            )
          })}
        </Select>
      ) : (
        <Input disabled={afterDisabled} />
      )
    return dom
  }

  const getInputItem = (data: UnitConversionItem) => {
    const { type, defaultValue, disabled, min, afterType } = data
    return (
      <Input
        style={afterType === 'input' ? { width: 60 } : {}}
        type={type}
        defaultValue={defaultValue}
        disabled={disabled}
        min={min}
      />
    )
  }

  return (
    <Input.Group>
      <Space size={0} align='start'>
        <Form.Item name={front.inputName} noStyle style={front.style}>
          {getInputItem(front)}
        </Form.Item>
        <Form.Item noStyle name={front.afterName}>
          {getAfterNode(front)}
        </Form.Item>
        <div style={{ padding: '5px 10px' }}>=</div>
        <Form.Item name={end.inputName} noStyle>
          <InputNumber
            style={end.afterType === 'input' ? { width: 60 } : {}}
            disabled={end.disabled}
            min={end.min}
          />
        </Form.Item>
        <Form.Item name={end.afterName} noStyle>
          {getAfterNode(end)}
        </Form.Item>
      </Space>
    </Input.Group>
  )
})

export default UnitConversion
