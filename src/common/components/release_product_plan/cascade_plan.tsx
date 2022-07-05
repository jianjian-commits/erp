import { Cascader, Col, Divider, Form, Input, Row } from 'antd'
import { DefaultOptionType } from 'antd/lib/cascader'
import { t } from 'gm-i18n'
import React, { FC } from 'react'
import { ProductionPlanOrderType } from './interface'

interface Props {
  data: ProductionPlanOrderType
  options: DefaultOptionType[]
}

const CascaderProductPlan: FC<Props> = ({ data, options }) => {
  const { head, orderName, batchName } = data
  return (
    <>
      {head && <Divider orientation='left'>{head}</Divider>}
      <Row gutter={6}>
        <Col span={9}>
          <Form.Item name={orderName} label={t('加入已有生产计划')}>
            <Cascader
              options={options}
              placeholder={t('选择生产计划')}
              expandTrigger='hover'
            />
          </Form.Item>
        </Col>
        <Col span={7}>
          <Form.Item name={batchName} label={t('备注')}>
            <Input placeholder={t('请输入备注信息')} />
          </Form.Item>
        </Col>
      </Row>
    </>
  )
}

export default CascaderProductPlan
