import React, { FC, useEffect, useState } from 'react'
import { t } from 'gm-i18n'
import { observer } from 'mobx-react'
import store from './store'
import { history } from '@/common/service'
import { useGMLocation } from '@gm-common/router'
import { Form, Input, Card, Radio, message } from 'antd'
import {
  STATUS_RADIO_ENUM,
  IS_DEFAULT_ENUM,
  TYPE_RADIO_ENUM,
} from '../constants'
import ButtonGroupFixed from '@/common/components/button_group_fixed'
import { QuotaionFieldValues } from '../data'
import { Quotation_Type } from 'gm_api/src/merchandise'

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

const initialValues = {
  status: STATUS_RADIO_ENUM[0].value,
  is_default: IS_DEFAULT_ENUM[1].value,
  type: Quotation_Type.WITHOUT_TIME,
}

type CreateQuotation = {
  isCreate: boolean
}

/**
 * 报价单详情
 */
const CreateQuotation: FC<CreateQuotation> = observer((props) => {
  const { isCreate } = props
  const location = useGMLocation<{ quotation_id: string }>()
  const { quotation_id } = location.query

  const [form] = Form.useForm()

  const [disabled, setDisable] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!isCreate) fetchDetail()
    return () => store.clearStore()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const fetchDetail = () => {
    store.getQuotation(quotation_id).then((res) => {
      const {
        quotation: {
          description,
          inner_name,
          outer_name,
          status,
          is_default,
          type,
        },
      } = res
      setDisable(!!is_default)
      form.setFieldsValue({
        outer_name,
        inner_name,
        description,
        status,
        is_default,
        type,
      })
    })
  }

  const onFinish = (values: QuotaionFieldValues) => {
    setLoading(true)
    const onSubmit = isCreate ? store.create : store.update
    onSubmit(values)
      .then((json) => {
        const { quotation } = json.response
        message.success(t(`${isCreate ? '新建' : '编辑'}成功`))
        if (isCreate && quotation) {
          history.push(
            `/merchandise/price_manage/customer_quotation/detail?quotation_id=${quotation?.quotation_id}&type=${quotation?.type}`,
          )
        } else {
          handleCancel()
        }
      })
      .finally(() => setLoading(false))
  }

  const handleCancel = () => {
    history.go(-1)
  }

  return (
    <Card
      title='基本信息'
      bordered={false}
      className='gm-site-card-border-less-wrapper-50'
    >
      <Form
        {...formItemLayout}
        layout='horizontal'
        onFinish={onFinish}
        form={form}
        initialValues={initialValues}
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
          label={t('设置默认')}
          name='is_default'
          help={t('报价单列表中仅能存在一个默认报价单')}
        >
          <Radio.Group disabled={disabled} options={IS_DEFAULT_ENUM} />
        </Form.Item>
        <Form.Item
          label={t('状态')}
          name='status'
          rules={[{ required: true }]}
          help={t('报价单激活后客户可正常下单，否则无法下单')}
        >
          <Radio.Group options={STATUS_RADIO_ENUM} />
        </Form.Item>
        <Form.Item
          label={t('类型')}
          name='type'
          rules={[{ required: true }]}
          help={t('选择周期报价单时可对商品进行周期报价')}
        >
          <Radio.Group disabled={!isCreate} options={TYPE_RADIO_ENUM} />
        </Form.Item>
        <Form.Item label={t('描述')} rules={[{ max: 100 }]} name='description'>
          <Input.TextArea
            rows={4}
            maxLength={100}
            placeholder={t('请填写报价单描述')}
            showCount
          />
        </Form.Item>
        <ButtonGroupFixed onCancel={handleCancel} loading={loading} />
      </Form>
    </Card>
  )
})

CreateQuotation.defaultProps = {
  isCreate: true,
}

export default CreateQuotation
