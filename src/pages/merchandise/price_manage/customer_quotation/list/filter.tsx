import React from 'react'
import { observer } from 'mobx-react'
import { t } from 'gm-i18n'
import { Form, Input, Button, Select } from 'antd'
import { gmHistory as history } from '@gm-common/router'
import store from '../store'
import { QUOTATION_TYPE_OPTIONS, STATUS_OPTIONS } from '../constants'
import PermissionJudge from '@/common/components/permission_judge'
import { Permission } from 'gm_api/src/enterprise'
import { Quotation_Type } from 'gm_api/src/merchandise'

const filterStyle = {
  padding: '16px',
  display: 'flex',
  justifyContent: 'space-between',
}

const initialValues = {
  quotation_type: Quotation_Type.UNSPECIFIED,
  quotation_status: 0,
  quotation_q: '',
}

/** 报价单列表Filter */
const Filter = observer(() => {
  const [form] = Form.useForm()

  const handleCreate = () => {
    history.push('/merchandise/price_manage/customer_quotation/create')
  }

  const handleSearch = () => {
    const value = form.getFieldsValue()
    store.setFilter(value)
  }

  return (
    <div style={filterStyle}>
      <Form
        form={form}
        name='merchandise-manage-sale'
        layout='inline'
        onFinish={handleSearch}
        initialValues={initialValues}
      >
        {/** 报价单类型 */}
        <Form.Item label='' name='quotation_type'>
          <Select
            options={QUOTATION_TYPE_OPTIONS}
            style={{ minWidth: 100 }}
            onSelect={handleSearch}
          />
        </Form.Item>
        <Form.Item label='' name='quotation_status'>
          <Select
            options={STATUS_OPTIONS}
            style={{ minWidth: 100 }}
            onSelect={handleSearch}
          />
        </Form.Item>
        <Form.Item label='' name='quotation_q'>
          <Input.Search
            loading={store.loading}
            placeholder={t('请输入报价单名称/编码')}
            style={{ minWidth: 120 }}
            enterButton={t('搜索')}
            onSearch={handleSearch}
          />
        </Form.Item>
      </Form>

      <PermissionJudge
        permission={Permission.PERMISSION_MERCHANDISE_CREATE_QUOTATION}
      >
        <Button type='primary' onClick={handleCreate}>
          {t('新建')}
        </Button>
      </PermissionJudge>
    </div>
  )
})

export default Filter
