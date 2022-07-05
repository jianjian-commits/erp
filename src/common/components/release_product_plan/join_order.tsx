import { Col, Form, Radio, Row } from 'antd'
import { t } from 'gm-i18n'
import { Filters_Bool } from 'gm_api/src/common'
import React from 'react'
import TipMessage from '@/pages/order/order_manage/list/components/product_plan/components/tip_message'

const TipContent = (
  <>
    <div>{t('选择是后，生成的需求将加入到自己选择的生产计划中；')}</div>
    <div>
      {t(
        '选择否后，生成的需求会优先加入到相同交期和产线的生产计划中，没有适合的生产计划，生成的需求会加入到新建的生产计划中；',
      )}
    </div>
  </>
)

const JoinOrder = () => {
  return (
    <Row>
      <Col>
        <Form.Item name='to_production_order' label={t('加入已有生产计划')}>
          <Radio.Group
            options={[
              {
                label: t('是'),
                value: Filters_Bool.TRUE,
              },
              {
                label: t('否'),
                value: Filters_Bool.FALSE,
              },
            ]}
          />
        </Form.Item>
      </Col>
      <Col style={{ lineHeight: '32px' }}>
        <TipMessage content={TipContent} />
      </Col>
    </Row>
  )
}

export default JoinOrder
