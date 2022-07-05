import { ProductionPlanTimeType } from './interface'
import { deliveryType } from '@/pages/order/enum'
import { Col, DatePicker, Divider, Form, Input, Row, Select } from 'antd'
import { t } from 'gm-i18n'

import React, { FC } from 'react'

const TimeRow: FC<{ data: ProductionPlanTimeType }> = ({ data }) => {
  const { head, name, timeName, batchName } = data
  return (
    <>
      <Divider orientation='left'>{head}</Divider>
      <Row gutter={6}>
        <Col span={9}>
          <Form.Item name={name} label={t('计划交期设置')}>
            <Select placeholder={t('请选择')} options={deliveryType} />
          </Form.Item>
        </Col>
        <Form.Item noStyle shouldUpdate>
          {({ getFieldValue }) =>
            getFieldValue(name) === 2 ? (
              <Col span={7}>
                <Form.Item name={timeName} label=''>
                  <DatePicker format='YYYY-MM-DD' />
                </Form.Item>
              </Col>
            ) : null
          }
        </Form.Item>
        <Col span={7}>
          <Form.Item name={batchName} label={t('备注')}>
            <Input placeholder={t('请输入备注信息')} />
          </Form.Item>
        </Col>
      </Row>
    </>
  )
}

export default TimeRow
