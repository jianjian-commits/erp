/* eslint-disable promise/no-nesting */
import React, { useState, forwardRef, useImperativeHandle } from 'react'
import { t } from 'gm-i18n'
import { Modal, Form, message, InputNumber } from 'antd'
import CategoryCascader from '@/pages/merchandise/components/category_cascader'
import { Sku, UpdateSkuV2 } from 'gm_api/src/merchandise'
import _ from 'lodash'
import store from '../store'
const formItemLayout = {
  labelCol: { span: 6 },
  wrapperCol: { span: 16 },
}

export interface EditTaxModalRef {
  handleOpen: (record: Sku) => void
  handleClose: () => void
}

const TAX_NUMBER_INPUT_CONFIG = {
  step: 1,
  addonAfter: '%',
  min: 0,
  max: 100,
  precision: 0,
  type: 'number',
}

/** 编辑税率 */
const EditTaxModal = forwardRef<EditTaxModalRef>((__, ref) => {
  const [form] = Form.useForm()
  const [visible, setVisible] = useState(false)
  const [loading, setLoading] = useState(false)
  const [title, setTitle] = useState(t('编辑商品'))
  const [sku, setSku] = useState<Sku>()

  useImperativeHandle(ref, () => ({
    handleOpen: showModal,
    handleClose: handleCancel,
  }))

  const showModal = (record: Sku) => {
    setVisible(true)
    const { tax, input_tax, name, finance_category_id } = record
    setSku(record)
    const parentNode = _.find(
      store.financeCategoryTree.slice(),
      (f) =>
        _.findIndex(
          f.children?.slice(),
          (c) => c.value === finance_category_id,
        ) !== -1,
    )
    setTitle(name || t('编辑商品'))
    form.setFieldsValue({
      finance_category_ids: parentNode
        ? [parentNode.value, finance_category_id]
        : undefined,
      tax,
      input_tax,
    })
  }

  const handleOk = () => {
    const fieldValues = form.getFieldsValue()
    const { finance_category_ids, tax, input_tax } = fieldValues
    const params: any = {
      ...sku,
      tax: String(tax),
      input_tax: String(input_tax),
      finance_category_id: finance_category_ids ? finance_category_ids[1] : '0',
    }

    UpdateSkuV2({ sku: params })
      .then(() => {
        message.success('编辑成功')
      })
      .finally(() => {
        handleCancel()
        store.setFilter({ ...store.filter })
      })
  }

  const handleCancel = () => {
    setVisible(false)
    setLoading(false)
    form.resetFields()
  }

  return (
    <Modal
      title={title}
      destroyOnClose
      onOk={handleOk}
      confirmLoading={loading}
      onCancel={handleCancel}
      visible={visible}
    >
      <Form form={form} {...formItemLayout} layout='horizontal'>
        <Form.Item label={t('税收分类')} name='finance_category_ids'>
          <CategoryCascader
            placeholder={t('请选择税收分类')}
            options={store.financeCategoryTree}
            fieldNames={{ label: 'text' }}
          />
        </Form.Item>

        <Form.Item label={t('销项税率')} name='tax'>
          <InputNumber {...TAX_NUMBER_INPUT_CONFIG} />
        </Form.Item>
        <Form.Item label={t('进项税率')} name='input_tax'>
          <InputNumber {...TAX_NUMBER_INPUT_CONFIG} />
        </Form.Item>
      </Form>
    </Modal>
  )
})

export default EditTaxModal
