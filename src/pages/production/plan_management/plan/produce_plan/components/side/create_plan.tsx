import { t } from 'gm-i18n'
import React, { forwardRef, useImperativeHandle } from 'react'
import { Form, DatePicker, Select, Input } from 'antd'
import store from '@/pages/production/plan_management/plan/store'
import { observer } from 'mobx-react'
import moment from 'moment'

const CreatePlan = forwardRef<any, { needBatch?: boolean }>(
  ({ needBatch }, ref) => {
    const form = Form.useFormInstance() ?? Form.useForm()[0]
    const { productionLineList } = store

    const getParams = () => {
      return form.validateFields()
    }

    const handleName = (data: moment.Moment) => {
      if (form.getFieldValue('name')) return
      form.setFieldsValue({
        name: data!.format('MM-DD') + t('生产计划'),
      })
    }

    useImperativeHandle(ref, () => ({
      getParams,
    }))

    return (
      <Form form={form} style={{ maxWidth: '400px' }} labelCol={{ span: 5 }}>
        <Form.Item
          label='计划交期'
          name='delivery_time'
          rules={[{ required: true, message: '计划交期不能为空' }]}
        >
          <DatePicker
            allowClear={false}
            onChange={(data) => handleName(data)}
          />
        </Form.Item>
        <Form.Item label='生产产线' name='production_line_id'>
          <Select
            allowClear
            options={productionLineList}
            placeholder={t('选择生产产线')}
          />
        </Form.Item>
        <Form.Item
          label={t('计划名称')}
          name='name'
          rules={[{ required: true, message: '计划名称不能为空' }]}
        >
          <Input maxLength={30} />
        </Form.Item>
        {needBatch && (
          <Form.Item name='production_batch' label={t('备注')}>
            <Input placeholder={t('请输入备注信息')} />
          </Form.Item>
        )}
      </Form>
    )
  },
)

export default observer(CreatePlan)
