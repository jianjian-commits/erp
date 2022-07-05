/**
 * @description 新建商品-基本信息-生产单位
 */
import React, { FC, useEffect, useState } from 'react'
import { observer } from 'mobx-react'
import { Space, Form, Input, Select } from 'antd'
import _ from 'lodash'
import { isNumberValid } from '@/pages/merchandise/manage/merchandise_list/create/util'
import store from '@/pages/merchandise/manage/merchandise_list/create/store'

const { Option } = Select

const ProductUnit: FC = observer(() => {
  const { productionUnitList, basicUnitObj, formValue, useInBom } = store

  /** 换算值是否可编辑，当生产单位为基本单位时，换算值默认为1且不可编辑 */
  const [isNumberDisabled, setIsNumberDisabled] = useState<boolean>(false)

  useEffect(() => {
    setIsNumberDisabled(basicUnitObj.unit_id === formValue.production_unit_id)
  }, [basicUnitObj, formValue])
  /** 生产单位校验 */
  const productUnitValidator = (event: any, value: string) => {
    return isNumberValid(value)
  }

  return (
    <Input.Group>
      <Space size={0} align='start'>
        <Form.Item
          name='production_num'
          noStyle
          style={{ minWidth: 200 }}
          rules={[{ validator: productUnitValidator }]}
        >
          <Input disabled={isNumberDisabled} />
        </Form.Item>
        <Form.Item noStyle name='production_unit_id'>
          <Select disabled={useInBom} style={{ width: 80 }}>
            {_.map(productionUnitList, (unitItem) => {
              const { value, text } = unitItem
              return (
                <Option key={value} value={value}>
                  {text}
                </Option>
              )
            })}
          </Select>
        </Form.Item>
        <div style={{ padding: '5px 10px' }}>=</div>
        <Form.Item name='product_basic_unit' noStyle>
          <Input disabled />
        </Form.Item>
      </Space>
    </Input.Group>
  )
})

export default ProductUnit
