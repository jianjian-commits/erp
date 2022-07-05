import React, { useEffect, FC } from 'react'
import { FormPanel, Flex } from '@gm-pc/react'
import { Form, Input, Row, Col, Button } from 'antd'
import { t } from 'gm-i18n'
import store from '../store'
import { observer, Observer } from 'mobx-react'
import { useGMLocation, gmHistory as history } from '@gm-common/router'
import { BaseInfoProps } from '../interface'
const BaseInfo: FC<BaseInfoProps> = observer(({ is_look, class_id }) => {
  const { setBaseInfo } = store
  const location = useGMLocation<{ class_id: string }>()
  const [form] = Form.useForm()
  useEffect(() => {
    if (location.query.class_id) {
      store.getCustomer(location.query.class_id).then(() => {
        form.setFieldsValue({
          name: store.baseInfo.name,
          receiver: store.baseInfo?.attrs?.addresses?.[0].receiver,
          phone: store.baseInfo?.attrs?.addresses?.[0].phone,
        })
      })
    }
  }, [])

  const handleDetail = () => {
    history.push(
      `/customer/school/class_management/create_class?class_id=${class_id}`,
    )
  }

  return (
    <FormPanel title={t('基础信息')}>
      <Form form={form} labelCol={{ span: 3 }} wrapperCol={{ span: 18 }}>
        <Form.Item required label={t('班级名称')} name='name'>
          <Input
            disabled={is_look}
            maxLength={30}
            onChange={(value) => setBaseInfo('name', '' + value.target.value)}
            style={{ width: '250px' }}
          />
        </Form.Item>
        <Row>
          <Col span={12}>
            <Form.Item
              labelCol={{ span: 6 }}
              name='receiver'
              label={t('收货人')}
            >
              <Input
                disabled={is_look}
                onChange={(value) =>
                  setBaseInfo(
                    'attrs.addresses[0].receiver',
                    '' + value.target.value,
                  )
                }
                style={{ width: '250px' }}
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              labelCol={{ span: 6 }}
              name='phone'
              label={t('收货人电话')}
            >
              <Input
                disabled={is_look}
                maxLength={11}
                onChange={(value) =>
                  setBaseInfo(
                    'attrs.addresses[0].phone',
                    '' + value.target.value,
                  )
                }
                style={{ width: '250px' }}
              />
            </Form.Item>
          </Col>
        </Row>
      </Form>
      {is_look && (
        <Button className='base-info-btn' type='primary' onClick={handleDetail}>
          {t('编辑')}
        </Button>
      )}
    </FormPanel>
  )
})
export default BaseInfo
