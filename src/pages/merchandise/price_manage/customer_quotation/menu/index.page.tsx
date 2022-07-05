import React, { FC, useEffect } from 'react'
import { t } from 'gm-i18n'
import { observer } from 'mobx-react'
import store from './store'
import { history } from '@/common/service'
import { useGMLocation } from '@gm-common/router'
import { Form, Input, Card, Radio, message } from 'antd'
import { STATUS_RADIO_ENUM } from '../constants'
import ButtonGroupFixed from '@/common/components/button_group_fixed'
import { QuotaionFieldValues } from '../data'

const formItemLayout = {
  labelCol: {
    xs: { span: 2 },
    sm: { span: 3 },
  },
  wrapperCol: {
    xs: { span: 6 },
    sm: { span: 6 },
  },
}

/**
 * 报价单详情
 */
const Menu: FC = observer(() => {
  const location = useGMLocation<{ quotation_id: string; viewType: string }>()
  const { quotation_id, viewType } = location.query
  const isCreate = viewType === 'create'

  const [form] = Form.useForm()

  useEffect(() => {
    fetchDetail()
    return () => store.clearStore()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const fetchDetail = () => {
    if (isCreate) {
      form.setFieldsValue({ is_active: STATUS_RADIO_ENUM[0].value })
      return
    }
    store.getQuotation(quotation_id).then((res) => {
      const {
        quotation: { description, inner_name, outer_name, is_active },
      } = res
      form.setFieldsValue({ outer_name, inner_name, description, is_active })
    })
  }

  const onFinish = (values: QuotaionFieldValues): void => {
    if (isCreate) {
      store.create(values)
    } else {
      store.update(values)
    }
    message.success(t(`${isCreate ? '新建' : '编辑'}成功`))
    history.push('/merchandise/price_manage/customer_quotation')
  }

  const handleCancel = () => {
    history.go(-1)
  }

  return (
    <Card title={isCreate ? t('新建报价单') : t('编辑报价单')} bordered={false}>
      <Form
        {...formItemLayout}
        layout='horizontal'
        onFinish={onFinish}
        form={form}
      >
        <Form.Item
          label={t('报价单名称')}
          name='inner_name'
          rules={[{ required: true }, { max: 30 }]}
        >
          <Input placeholder={t('输入报价单名称')} />
        </Form.Item>
        <Form.Item
          name='outer_name'
          label={t('报价单名称(对外)')}
          rules={[{ required: true }, { max: 6 }]}
        >
          <Input placeholder={t('用于下单商城的展现，不超过6个字符')} />
        </Form.Item>
        <Form.Item
          label={t('状态')}
          name='is_active'
          help={t('报价单激活后客户可正常下单，否则无法下单')}
        >
          <Radio.Group options={STATUS_RADIO_ENUM} />
        </Form.Item>
        <Form.Item label={t('描述')} rules={[{ max: 100 }]} name='description'>
          <Input.TextArea rows={4} />
        </Form.Item>
        <ButtonGroupFixed onCancel={handleCancel} />
      </Form>
    </Card>
  )
})

export default Menu
