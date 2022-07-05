import React, { FC, useRef } from 'react'
import { observer } from 'mobx-react'
import { t } from 'gm-i18n'
import { Form, Input, Button, Space, Select } from 'antd'
import { DetailModalRef } from '../../interface'
import { SHELF_OPTIONS } from '@/pages/merchandise/price_manage/customer_quotation/constants'
import store from '../store'
import DetailModal from '../bound_modal/detail_modal'
import PermissionJudge from '@/common/components/permission_judge'
import { Permission } from 'gm_api/src/enterprise'

const filterStyle = {
  padding: '0 24px 16px 24px',
  display: 'flex',
  justifyContent: 'space-between',
  borderBottom: '1px solid rgba(0, 0, 0, 0.07)',
}

const initialValues = { on_shelf: 0, q: '' }

const Filter: FC = () => {
  const { setFilter } = store
  const modalRef = useRef<DetailModalRef>(null)

  const [form] = Form.useForm()

  /*
   * 关联组报价单
   */
  const handleAssociatedClient = () => {
    modalRef.current && modalRef.current.openModal(true)
  }

  const handleSearch = () => {
    const value = form.getFieldsValue()
    setFilter({ ...value })
  }

  return (
    <>
      <div style={filterStyle}>
        <Form
          form={form}
          name='merchandise-manage-sale'
          layout='inline'
          initialValues={initialValues}
        >
          <Form.Item name='on_shelf'>
            <Select
              placeholder={t('请选择')}
              options={SHELF_OPTIONS}
              style={{ minWidth: 100 }}
              onChange={handleSearch}
            />
          </Form.Item>
          <Form.Item name='quotation_q'>
            <Input.Search
              loading={store.quotationLoading}
              placeholder={t('请输入报价单名称/编码')}
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
              {t('关联报价单')}
            </Button>
          </PermissionJudge>
        </Space>
      </div>
      <DetailModal ref={modalRef} />
    </>
  )
}

export default observer(Filter)
