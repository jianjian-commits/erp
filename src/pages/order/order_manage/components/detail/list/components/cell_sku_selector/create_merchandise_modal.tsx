import React, { useCallback, useEffect } from 'react'
import { Form, FormInstance, Input, Select, Modal } from 'antd'
import { t } from 'gm-i18n'

import CategoryCascader from '@/pages/merchandise/manage/merchandise_list/create/base_info/category_cascader'
import globalStore from '@/stores/global'
import { Tip } from '@gm-pc/react'
import { Rule } from 'antd/es/form'
import createSku, { CreateSkuParams } from './create_sku'
import { SelectBasicUnit } from '@/common/components/select_unit'
interface CreateMerchandiseModalProps {
  /**
   * 控制 Modal 显示
   */
  visible?: boolean
  /**
   * 默认商品名称
   */
  defaultSkuName?: string
  /**
   * antd Form.useForm 创建的 Form 实例
   */
  form?: FormInstance
  /**
   * 层级
   */
  zIndex?: number
  /**
   * 关闭 Modal
   */
  onClose?: (visible: false) => void
  /**
   * 商品创建完成回调
   */
  onFinish?: () => void
}

type FormModelShape = CreateSkuParams

const FormRules: Record<keyof FormModelShape, Rule[]> = {
  name: [
    { required: true, message: t('请填写商品名称') },
    { max: 40, message: '商品名称请勿超出 40 字' },
  ],
  categories: [{ required: true, message: t('请选择商品分类') }],
  unitId: [{ required: true, message: t('请选择基本单位') }],
}

const CreateMerchandiseModal: React.FC<CreateMerchandiseModalProps> = (
  props,
) => {
  const {
    visible,
    zIndex,
    form: formInstance,
    defaultSkuName,
    onClose,
    onFinish,
  } = props
  const [form] = Form.useForm<FormModelShape>(formInstance)

  useEffect(() => {
    if (defaultSkuName) {
      form.setFieldsValue({
        name: defaultSkuName,
      })
    }
  }, [defaultSkuName, form])

  const handleClose = useCallback(() => {
    if (typeof onClose === 'function') {
      onClose(false)
    }
  }, [onClose])

  const handleSubmit = (model: FormModelShape) => {
    createSku(model)
      .then(() => {
        if (typeof onFinish === 'function') {
          onFinish()
        }
        handleClose()
        Tip.success({
          children: (
            <>
              <span className='tw-font-bold'>{model.name}</span>
              {t('商品快速创建成功，可前往商品库查看')}
            </>
          ),
        })
      })
      .then(() => {
        form.resetFields()
      })
  }

  return (
    <Modal
      title={t('快速创建商品')}
      visible={visible}
      onCancel={handleClose}
      onOk={form.submit}
      zIndex={zIndex}
    >
      <Form<FormModelShape> form={form} onFinish={handleSubmit}>
        <Form.Item name='name' label={t('商品名称')} rules={FormRules.name}>
          <Input placeholder={t('请输入商品名称')} maxLength={40} />
        </Form.Item>
        <Form.Item
          name='categories'
          label={t('商品分类')}
          rules={FormRules.categories}
        >
          <CategoryCascader showAdd={false} />
        </Form.Item>
        <Form.Item name='unitId' label={t('基本单位')} rules={FormRules.unitId}>
          <SelectBasicUnit placeholder={t('请选择基本单位')} />
        </Form.Item>
      </Form>
    </Modal>
  )
}

export default CreateMerchandiseModal
