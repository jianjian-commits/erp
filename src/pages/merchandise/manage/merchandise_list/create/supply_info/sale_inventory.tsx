/**
 * @description 新建商品-供应链信息-销售库存
 */
import React, { FC } from 'react'
import { observer } from 'mobx-react'
import { Form, Input, InputNumber, Select, Space } from 'antd'
import _ from 'lodash'
import { t } from 'gm-i18n'
import { saleInventory } from '@/pages/merchandise/manage/merchandise_list/emnu'
import store from '@/pages/merchandise/manage/merchandise_list/create/store'

const { Option } = Select

const SaleInventoryItem: FC = observer(() => {
  const { formValue, basicUnitObj } = store

  /** 销售库存数值校验 */
  const saleStocksNumValidator = (event: any, value: string) => {
    const reg = /^(\d+)(.\d{0,2})?$/

    if (!reg.test(value)) {
      return Promise.reject(
        new Error(t('销售库存必须为大于0，小数点后至多两位的数值')),
      )
    } else {
      return Promise.resolve(new Error())
    }
  }

  return (
    <Input.Group>
      <Space size={16}>
        <Form.Item name='sale_stocks' style={{ width: '100%' }} noStyle>
          <Select style={{ minWidth: 150 }}>
            {_.map(saleInventory, (optionItem) => {
              const { value, text } = optionItem
              return (
                <Option key={value} value={value}>
                  {t(text)}
                </Option>
              )
            })}
          </Select>
        </Form.Item>

        {formValue.sale_stocks === '3' && (
          <Form.Item
            name='sale_stocks_num'
            rules={[
              {
                required: formValue.sale_stocks === '3',
                message: '请填写库存存值',
              },
              { validator: saleStocksNumValidator },
            ]}
            noStyle
          >
            <InputNumber
              style={{ width: 150 }}
              min={0}
              addonAfter={basicUnitObj.text}
            />
          </Form.Item>
        )}
      </Space>
    </Input.Group>
  )
})

export default SaleInventoryItem
