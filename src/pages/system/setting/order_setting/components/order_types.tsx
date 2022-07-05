import React, { forwardRef, useEffect, useImperativeHandle } from 'react'
import { Col, Input, Row, Form, Button } from 'antd'
import { PlusCircleOutlined } from '@ant-design/icons'
import store from '../store'
import { observer } from 'mobx-react'
import _ from 'lodash'
import { t } from 'gm-i18n'
import SvgDelete from '@/svg/delete.svg'

export interface OrderTypesProps {
  order_types: string[]
}

export interface OrderTypesRefProps {
  getOrderTypes: () => string[]
  validate: any
}

const OrderTypes = forwardRef<OrderTypesRefProps, OrderTypesProps>(
  ({ order_types }, ref) => {
    const [formRef] = Form.useForm()
    useImperativeHandle(ref, () => ({
      getOrderTypes() {
        return formRef.getFieldsValue(true)
      },
      validate() {
        return formRef.validateFields()
      },
    }))

    return (
      <>
        <Form name='order_type_form' form={formRef} preserve={false}>
          <Form.List name='order_type' initialValue={order_types}>
            {(fields, { add, remove }) => {
              return (
                <>
                  {fields.map(({ name }, index) => {
                    return (
                      <Row key={name}>
                        <Col span={20}>
                          <Form.Item
                            name={[name, 'name']}
                            label={t(`订单类型${index + 1}`)}
                            rules={[{ required: true, whitespace: true }]}
                          >
                            <Input />
                          </Form.Item>
                        </Col>
                        <Col span={3} offset={1}>
                          <Button
                            className='delete-btn'
                            shape='circle'
                            onClick={() => {
                              remove(name)
                            }}
                            disabled={fields.length === 1}
                            icon={<SvgDelete />}
                          />
                        </Col>
                      </Row>
                    )
                  })}
                  {fields.length < 10 && (
                    <Button
                      className='tw-block'
                      type='link'
                      onClick={() => {
                        add()
                      }}
                      icon={<PlusCircleOutlined />}
                    >
                      {t('增加一行')}
                    </Button>
                  )}
                </>
              )
            }}
          </Form.List>
        </Form>
        <p className='gm-text-desc gm-text-12'>
          {t(
            '订单类型可用于订单列表的筛选以及支持查看、打印客户账单时按订单类型进行聚合查看。',
          )}
        </p>
      </>
    )
  },
)

export default observer(OrderTypes)
