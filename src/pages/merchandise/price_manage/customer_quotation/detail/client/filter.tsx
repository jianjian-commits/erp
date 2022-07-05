import React, { FC, useRef } from 'react'
import { observer } from 'mobx-react'
import { t } from 'gm-i18n'
import { Form, Select, Input, Button, Space } from 'antd'
import store, { FilterType } from './store'
import AssocaitedClient, { AssociatedClientRef } from './associated_client'
import PermissionJudge from '@/common/components/permission_judge'
import { Permission } from 'gm_api/src/enterprise'

const filterStyle = {
  marginTop: -16,
  padding: '18px',
  display: 'flex',
  justifyContent: 'space-between',
  borderBottom: '1px solid rgba(0, 0, 0, 0.07)',
}

const Filter: FC = () => {
  const { setFilter } = store
  const modalRef = useRef<AssociatedClientRef>(null)

  const [form] = Form.useForm()

  /*
   * 关联客户
   */
  const handleAssociatedClient = () => {
    modalRef.current && modalRef.current.handleOpen()
  }

  const handleSearch = () => {
    const value: FilterType = form.getFieldsValue()
    setFilter({ ...value })
  }

  return (
    <>
      <div style={filterStyle}>
        <Form<FilterType>
          form={form}
          name='merchandise-manage-sale'
          layout='inline'
        >
          <Form.Item name='customer_label_ids'>
            <Select
              placeholder={t('请选择标签')}
              mode='multiple'
              maxTagCount={3}
              options={store.customerLabelList}
              style={{ minWidth: 200 }}
              onChange={handleSearch}
            />
          </Form.Item>
          <Form.Item name='q'>
            <Input.Search
              loading={store.loading}
              placeholder={t('请输入客户名称/编码')}
              style={{ minWidth: 120 }}
              enterButton={t('搜索')}
              onSearch={handleSearch}
            />
          </Form.Item>
        </Form>
        <Space>
          <PermissionJudge
            permission={Permission.PERMISSION_MERCHANDISE_UPDATE_QUOTATION}
          >
            <Button type='primary' onClick={handleAssociatedClient}>
              {t('关联客户')}
            </Button>
          </PermissionJudge>
        </Space>
      </div>
      <AssocaitedClient ref={modalRef} title={t('关联客户')} />
    </>
  )
}

export default observer(Filter)
