import { t } from 'gm-i18n'
import React, { FC, useEffect, useState } from 'react'
import { observer } from 'mobx-react'
import store, { initFormValue } from './store'
import globalStore from '@/stores/global'
import { gmHistory as history, useGMLocation } from '@gm-common/router'
import _ from 'lodash'
import { FileType } from 'gm_api/src/cloudapi'
import CategoryCascader from '@/pages/merchandise/manage/merchandise_list/create/base_info/category_cascader'
import { Form, Select, Input, Card, Row, Col, InputNumber, message } from 'antd'
import ButtonGroupFixed from '@/common/components/button_group_fixed'
import UploadImage from '@/pages/merchandise/manage/components/upload_images'
import { getCustomizedCode } from '@/common/util'
import {
  list_Sku_PackageSubSkuType,
  Sku_PackageSubSkuType,
} from 'gm_api/src/merchandise'

const SkuDetail: FC = observer(() => {
  const {
    setSkuId,
    formValue,
    setFormValue,
    submit,
    basicUnitObj,
    setBasicUnitObj,
    getSkuDetail,
    clearStore,
    setImageList,
    imageList,
  } = store

  const [wrapperForm] = Form.useForm()

  const location = useGMLocation<{ sku_id: string }>()
  const { sku_id } = location.query

  /** 是否随机生成商品编号 */
  const [canCustomer, setCanCustomer] = useState<boolean>(true)
  /** 是否正在提交 */
  const [isLoading, setIsLoading] = useState<boolean>(false)
  /** 货值是否显示 */
  const [packagePriceShow, setPackagePriceShow] = useState(true)

  useEffect(() => {
    if (sku_id) {
      getSku().then((response) => {
        // 初始的包材类型值用于判断货值是否显示
        const packageSubSkuType = response?.package_sub_sku_type
        packageSubSkuType === Sku_PackageSubSkuType.TURNOVER
          ? setPackagePriceShow(true)
          : setPackagePriceShow(false)
      })
      setSkuId(sku_id)
    } else {
      wrapperForm.setFieldsValue(initFormValue)
    }

    return () => {
      clearStore()
    }
  }, [sku_id])

  const getSku = async () => {
    const newFormValue = await getSkuDetail(sku_id)
    wrapperForm.setFieldsValue(newFormValue)
    return newFormValue
  }

  const setValues = (values: any) => {
    wrapperForm.setFieldsValue(values)
    setFormValue({ ...formValue, ...values })
  }

  const onBasicUnitChange = (id: string, allValues: any) => {
    const basicUnitItem = globalStore.getUnit(id)
    if (basicUnitItem) {
      setBasicUnitObj(basicUnitItem)
      setValues({
        ...allValues,
        production_unit_id: basicUnitItem.value,
        product_basic_unit: `1${basicUnitItem.text}`,
        purchase_unit_id: basicUnitItem.value,
      })
    }
  }

  const onValuesChange = (changedValues: any, allValues: any) => {
    // 自动生成商品编码
    if (changedValues.name) {
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

      setValues(newValues)
    } else if (changedValues.customize_code) {
      // 手动输入编码后，不能自动生成商品编码
      const customize_code = changedValues.customize_code.trim()
      setValues({
        ...allValues,
        customize_code,
      })
      setCanCustomer(false)
    } else if (changedValues.base_unit_id) {
      // 基本单位发生变化
      onBasicUnitChange(changedValues.base_unit_id, allValues)
    } else if (changedValues.package_sub_sku_type) {
      // 包材类型发生变化，改变货值选项显示
      const packageSubSkuType = changedValues.package_sub_sku_type
      packageSubSkuType === Sku_PackageSubSkuType.TURNOVER
        ? setPackagePriceShow(true)
        : setPackagePriceShow(false)
    }
  }

  const onFinish = (values: any) => {
    setIsLoading(true)
    submit(values)
      .then((json) => {
        const { sku } = json.response
        if (sku) {
          // return submitStockConfig(sku)
        } else {
          message.error(t(`${sku_id ? '编辑失败' : '新建失败'}`))
        }
      })
      .then(() => {
        message.success(t(`${sku_id ? '编辑成功' : '新建成功'}`))
        history.go(-1)
      })
      .finally(() => {
        setIsLoading(false)
      })
  }

  const handleCancel = () => {
    history.push('/merchandise/manage/wrapper')
  }

  const layout = {
    labelCol: { span: 6 },
    wrapperCol: { span: 14 },
  }

  const colProps = {
    xs: 24,
    sm: 24,
    md: 16,
    lg: 12,
    xl: 12,
  }

  const { unitList } = globalStore

  // 转换成Select组件options属性可以用的格式
  const unitListArr = _.map(unitList, (unitObj) => {
    return { label: unitObj.text, value: unitObj.value }
  })

  // 转换成Select组件options属性可以用的格式
  const packageSubSkuType = _.map(list_Sku_PackageSubSkuType, (item) => {
    return { label: item.text, value: item.value }
  })

  return (
    <>
      <Card
        className='gm-site-card-border-less-wrapper-50'
        title={t('基础信息')}
        bordered={false}
      >
        <Form
          {...layout}
          form={wrapperForm}
          layout='horizontal'
          labelAlign='right'
          scrollToFirstError
          // style={{ maxWidth: 1200 }}
          onFinish={onFinish}
          validateTrigger={['onChange', 'onFinish']}
          onValuesChange={onValuesChange}
        >
          <Row>
            <Col {...colProps}>
              <Form.Item
                name='categories'
                id='categories'
                label={t('所属分类')}
                rules={[{ required: true }]}
                wrapperCol={{ span: 12 }}
              >
                <CategoryCascader />
              </Form.Item>
            </Col>
            <Col {...colProps}>
              <Form.Item
                name='name'
                id='name'
                required
                label={t('商品名称')}
                rules={[{ required: true }]}
                wrapperCol={{ span: 12 }}
              >
                <Input
                  placeholder='请输入商品名称'
                  maxLength={40}
                  minLength={1}
                />
              </Form.Item>
            </Col>
          </Row>
          <Row>
            <Col {...colProps}>
              <Form.Item
                name='alias'
                id='alias'
                label={t('商品别名')}
                wrapperCol={{ span: 12 }}
                required={false}
              >
                <Input
                  maxLength={40}
                  minLength={1}
                  placeholder={t('请输入商品别名')}
                />
              </Form.Item>
            </Col>
            <Col {...colProps}>
              <Form.Item
                name='customize_code'
                id='customize_code'
                label={t('包材编码')}
                rules={[{ required: true }]}
                wrapperCol={{ span: 12 }}
              >
                <Input disabled={!!sku_id} maxLength={44} minLength={1} />
              </Form.Item>
            </Col>
          </Row>
          <Row>
            <Col {...colProps}>
              <Form.Item
                name='base_unit_id'
                id='base_unit_id'
                required
                label={t('基本单位')}
                rules={[{ required: true }]}
                wrapperCol={{ span: 12 }}
              >
                <Select
                  showSearch
                  allowClear
                  disabled={!!sku_id}
                  placeholder='请选择基本单位'
                  options={unitListArr}
                  optionFilterProp='label'
                />
              </Form.Item>
            </Col>
            <Col {...colProps}>
              <Form.Item
                name='package_sub_sku_type'
                id='package_sub_sku_type'
                label={t('包材类型')}
                rules={[{ required: true }]}
                wrapperCol={{ span: 12 }}
              >
                <Select options={packageSubSkuType} />
              </Form.Item>
            </Col>
          </Row>
          <Row>
            <Col {...colProps}>
              <Form.Item
                name='images'
                id='images'
                label={t('商品图片')}
                wrapperCol={{ span: 12 }}
              >
                <UploadImage
                  fileType={FileType.FILE_TYPE_MERCHANDISE_SKU_IMAGE}
                  fileLength={9}
                  setFileList={setImageList}
                  upload={{
                    fileList: imageList,
                    listType: 'picture-card',
                  }}
                />
              </Form.Item>
            </Col>
            {packagePriceShow && (
              <Col {...colProps}>
                <Form.Item
                  name='package_price'
                  id='package_price'
                  label={t('货值')}
                  required
                  rules={[{ required: true }]}
                  wrapperCol={{ span: 12 }}
                >
                  <InputNumber
                    step={0.01}
                    min={0}
                    addonAfter={`元 / ${basicUnitObj.text}`}
                    style={{ width: '200px' }}
                    precision={2}
                  />
                </Form.Item>
              </Col>
            )}
          </Row>
          <Row>
            <Col {...colProps}>
              <Form.Item
                name='desc'
                id='desc'
                label={t('描述')}
                rules={[{ max: 100 }]}
                help={t('对商品进行描述，长度小于等于100个字')}
                wrapperCol={{ span: 16 }}
              >
                <Input.TextArea rows={4} maxLength={100} />
              </Form.Item>
            </Col>
          </Row>
          <ButtonGroupFixed onCancel={handleCancel} loading={isLoading} />
        </Form>
      </Card>
    </>
  )
})

export default SkuDetail
