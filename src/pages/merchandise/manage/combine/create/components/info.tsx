/**
 * @description 组合商品-新建-基本信息
 */
import React, { useState, forwardRef, useImperativeHandle } from 'react'
import { t } from 'gm-i18n'
import { Form, Row, Col, Input, Radio, Select } from 'antd'
import { FileType } from 'gm_api/src/cloudapi'
import { useGMLocation } from '@gm-common/router'
import { getCustomizedCode } from '@/common/util'
import { observer } from 'mobx-react'
import _ from 'lodash'
import store, { CombineFormInterface } from '../store'
import { FormRefProps } from '../interface'
import { saleState } from '@/pages/merchandise/manage/emnu'
import { pinyin } from '@gm-common/tool'
import globalStore from '@/stores/global'
import UploadImage from '@/pages/merchandise/manage/components/upload_images'
import { SelectBasicUnit } from '@/common/components/select_unit'

const layout = {
  labelCol: { span: 6 },
  wrapperCol: { span: 14 },
}

const { Option } = Select

const Info = observer(
  forwardRef<FormRefProps, any>((props, ref) => {
    const { imageList, setImageList, skuId } = store
    const location = useGMLocation<{ sku_id: string }>()
    const { sku_id } = location.query

    const [form] = Form.useForm()
    /** 是否随机生成商品编号 */
    const [canCustomer, setCanCustomer] = useState<boolean>(true)

    const onValuesChange = (changedValues: any, allValues: any) => {
      // 自动生成商品编码
      if (changedValues.name && canCustomer && !sku_id) {
        const name = changedValues.name.trim()
        let newValues = {
          ...allValues,
          name,
        }

        if (canCustomer && !sku_id) {
          const customizeCode = `${getCustomizedCode(name)}${Math.floor(
            Math.random() * 10000,
          )}`
          newValues = { ...newValues, customize_code: customizeCode }
        }
        form.setFieldsValue(newValues)
      } else if (changedValues.customize_code) {
        // 手动输入编码后，不能自动生成商品编码
        const customize_code = changedValues.customize_code.trim()
        form.setFieldsValue({
          ...allValues,
          customize_code,
        })
        setCanCustomer(false)
      }
    }

    const submit = async () => {
      const result = await form
        .validateFields()
        .then((values) => {
          return values
        })
        .catch(() => false)
      return result
    }

    const setFieldsValue = (values: CombineFormInterface) => {
      form.setFieldsValue(values)
    }

    useImperativeHandle(ref, () => ({
      submit,
      setFieldsValue,
    }))

    return (
      <>
        <Form
          name='combine_shop'
          form={form}
          layout='horizontal'
          labelAlign='right'
          scrollToFirstError
          style={{ maxWidth: 1200 }}
          initialValues={{ sale_state: '1' }}
          onValuesChange={onValuesChange}
          onFinish={submit}
          {...layout}
        >
          <Row>
            <Col xs={24} sm={24} md={16} lg={12} xl={12}>
              <Form.Item
                label={t('组合商品名称')}
                name='name'
                rules={[{ required: true, message: t('请填写组合商品名称') }]}
              >
                <Input
                  maxLength={40}
                  minLength={1}
                  placeholder={t('请填写组合商品名称')}
                />
              </Form.Item>
            </Col>

            <Col xs={24} sm={24} md={16} lg={12} xl={12}>
              <Form.Item
                label={t('组合商品编码')}
                name='customize_code'
                rules={[{ required: true, message: t('请填写组合商品编码') }]}
              >
                <Input
                  disabled={!!skuId && skuId !== '0'}
                  maxLength={44}
                  minLength={1}
                  placeholder={t('请填写组合商品编码')}
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={24} md={16} lg={12} xl={12}>
              <Form.Item
                label={t('下单单位')}
                name='base_unit_id'
                rules={[{ required: true, message: t('请选择下单单位') }]}
              >
                <SelectBasicUnit
                  showSearch
                  filterOption={(input: string, option: any) => {
                    const text = input.toLocaleLowerCase()
                    return (
                      option!.children.indexOf(text) >= 0 ||
                      pinyin(option!.children).indexOf(text) >= 0
                    )
                  }}
                  placeholder={t('请选择下单单位')}
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={24} md={16} lg={12} xl={12}>
              <Form.Item label={t('销售状态')} name='sale_state'>
                <Radio.Group options={saleState} />
              </Form.Item>
            </Col>
            <Col xs={24} sm={24} md={16} lg={12} xl={12}>
              <Form.Item label={t('商品图片')} name='images'>
                <UploadImage
                  fileType={FileType.FILE_TYPE_MERCHANDISE_SKU_IMAGE}
                  fileLength={9}
                  setFileList={setImageList}
                  upload={{ fileList: imageList, listType: 'picture-card' }}
                />
              </Form.Item>
            </Col>
            <Col xs={0} sm={0} md={8} lg={12} xl={12} />
            <Col xs={24} sm={24} md={16} lg={12} xl={12}>
              <Form.Item
                wrapperCol={{ span: 16 }}
                label={t('商品描述')}
                name='desc'
              >
                <Input.TextArea
                  rows={4}
                  maxLength={100}
                  showCount
                  placeholder={t('请填写商品描述')}
                />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </>
    )
  }),
)
export default Info
