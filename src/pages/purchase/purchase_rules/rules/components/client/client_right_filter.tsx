import React, { useEffect } from 'react'
import { Form, Input, Row, Col, Button, Space, Cascader, message } from 'antd'
import { t } from 'gm-i18n'
import { observer, Observer } from 'mobx-react'
import SupplierSelect from '../supplier_select'
import PurchaseSelect from '../purchase_select'
import _ from 'lodash'
import { ClientFilter } from '../../interface'
import store, { initClientTableFilter } from '../../store'

const ClientRightFilter = () => {
  const [form] = Form.useForm()

  const {
    chooseClient,
    categoryData,
    getListPurchaseRules,
    setClientTableFilter,
    supplierList,
    purchaseList,
  } = store

  useEffect(() => {
    handleReset()
  }, [chooseClient.customer_id])

  const handleValuesChange = (__: any, all: ClientFilter) => {
    setClientTableFilter(all)
  }

  const handleReset = () => {
    form.resetFields()
    setClientTableFilter(initClientTableFilter)
  }

  const handleSearch = () => {
    if (!chooseClient.name) {
      return message.error(t('请先选择客户'))
    }
    const category_id: string | undefined =
      _.last(form.getFieldValue('category_id')) || undefined
    const supplier_id: string | undefined =
      form.getFieldValue('supplier_id') || undefined
    const purchaser_id: string | undefined =
      form.getFieldValue('purchaser_id') || undefined

    const filter_params = {
      sku_ids: [],
      customer_ids: [chooseClient.customer_id!],
      sku_name: form.getFieldValue('sku_name') || '',
      category_id,
      supplier_id,
      purchaser_id,
    }
    getListPurchaseRules(filter_params, 'client')
  }

  return (
    <div className='rules-list-right-filter'>
      <Observer>
        {() => {
          return (
            <>
              <div className='right-filter-header'>
                {t(chooseClient?.name || '-')}
              </div>
              <Form
                form={form}
                layout='inline'
                onValuesChange={handleValuesChange}
              >
                <Row style={{ width: '100%' }}>
                  <Col span={8}>
                    <Form.Item
                      labelCol={{ span: 6 }}
                      wrapperCol={{ span: 18 }}
                      name='sku_name'
                      label={t('商品名')}
                    >
                      <Input
                        allowClear
                        placeholder={t('请输入商品名称')}
                        autoComplete='off'
                      />
                    </Form.Item>
                  </Col>
                  <Col span={8}>
                    <Form.Item
                      labelCol={{ span: 6 }}
                      wrapperCol={{ span: 18 }}
                      name='category_id'
                      label={t('商品分类')}
                    >
                      <Cascader
                        placeholder={t('请选择所属分类')}
                        options={categoryData}
                        expandTrigger='hover'
                        changeOnSelect
                        showSearch
                      />
                    </Form.Item>
                  </Col>
                  <Col span={8}>
                    <Form.Item
                      labelCol={{ span: 6 }}
                      wrapperCol={{ span: 18 }}
                      name='supplier_id'
                      label={t('供应商')}
                    >
                      <SupplierSelect options={supplierList} />
                    </Form.Item>
                  </Col>
                  <Col span={8} className='tw-mt-4'>
                    <Form.Item
                      labelCol={{ span: 6 }}
                      wrapperCol={{ span: 18 }}
                      name='purchaser_id'
                      label={t('采购员')}
                    >
                      <PurchaseSelect options={purchaseList} />
                    </Form.Item>
                  </Col>
                  <Col className='tw-mt-4'>
                    <Space size='middle'>
                      <Button onClick={handleReset}>{t('清空')}</Button>
                      <Button type='primary' onClick={handleSearch}>
                        {t('搜索')}
                      </Button>
                    </Space>
                  </Col>
                </Row>
              </Form>
            </>
          )
        }}
      </Observer>
    </div>
  )
}
export default observer(ClientRightFilter)
