/**
 * @description 新建商品-包材信息-换算方式
 */
import React, { FC } from 'react'
import { observer } from 'mobx-react'
import { Form, Input, InputNumber, Select, Space } from 'antd'
import _ from 'lodash'
import { t } from 'gm-i18n'
import store from '@/pages/merchandise/manage/merchandise_list/create/store'
import {
  list_Sku_PackageCalculateType,
  Sku_PackageCalculateType,
} from 'gm_api/src/merchandise'

const { Option } = Select

const CalculateType: FC = observer(() => {
  const { formValue } = store

  /** 换算方式校验 */
  const packageNumValidator = (event: any, value: number) => {
    const reg = /^(\d+)(.\d{0,2})?$/
    if (!reg.test(value + '') || value <= 0) {
      return Promise.reject(
        new Error(t('换算方式必须为大于0，小数点后至多两位的数值')),
      )
    } else {
      return Promise.resolve(new Error())
    }
  }

  return (
    <Input.Group>
      <Space size={16}>
        <Form.Item
          name='package_calculate_type'
          style={{ width: '100%' }}
          noStyle
        >
          <Select style={{ minWidth: 150 }}>
            {_.map(list_Sku_PackageCalculateType, (optionItem) => {
              const { value, text } = optionItem
              return (
                <Option key={value} value={value}>
                  {t(text)}
                </Option>
              )
            })}
          </Select>
        </Form.Item>

        {formValue.package_calculate_type &&
          formValue.package_calculate_type ===
            Sku_PackageCalculateType.FIXED && (
            <Form.Item
              name='package_num'
              noStyle
              rules={[{ validator: packageNumValidator }]}
            >
              <InputNumber style={{ width: 150 }} min={0} />
            </Form.Item>
          )}
      </Space>
    </Input.Group>
  )
})

export default CalculateType
