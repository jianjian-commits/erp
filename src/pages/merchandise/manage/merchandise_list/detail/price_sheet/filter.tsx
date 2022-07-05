import React, { FC, useRef } from 'react'
import { observer } from 'mobx-react'
import { t } from 'gm-i18n'
import { Form, Input, Button, Space, Select } from 'antd'
import store, { FilterType } from './store'
import AssociatedGoods, { AssociatedGoodsRef } from './associated_quotation'
import PermissionJudge from '@/common/components/permission_judge'
import { Permission } from 'gm_api/src/enterprise'

/** 上架下架全部状态 */
export const SHELF_OPTIONS = [
  { value: 0, label: t('全部状态') },
  { value: 1, label: t('上架') },
  { value: 2, label: t('下架') },
]

const filterStyle = {
  padding: '15px 24px',
  borderBottom: '1px solid rgba(0, 0, 0, 0.07)',
  display: 'flex',
  justifyContent: 'space-between',
}

const initialValues = { on_shelf: 0, quotation_q: '' }

const Filter: FC = () => {
  const { setFilter } = store
  const modalRef = useRef<AssociatedGoodsRef>(null)

  const [form] = Form.useForm()

  const handleAssociatedGoods = () => {
    modalRef.current && modalRef.current.handleOpen()
  }

  const handleSearch = () => {
    const value = form.getFieldsValue()
    setFilter({ ...value })
  }

  return (
    <>
      <div style={filterStyle}>
        <Form<FilterType>
          form={form}
          name='merchandise-manage-sale'
          layout='inline'
          onFinish={handleSearch}
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
              placeholder={t('请输入报价单名称/编码')}
              style={{ minWidth: 120 }}
              enterButton={t('搜索')}
              onSearch={handleSearch}
              loading={store.loading}
            />
          </Form.Item>
        </Form>
        <Space>
          <PermissionJudge
            permission={Permission.PERMISSION_MERCHANDISE_UPDATE_QUOTATION}
          >
            <Button type='primary' onClick={handleAssociatedGoods}>
              {t('关联报价单')}
            </Button>
          </PermissionJudge>
        </Space>
      </div>
      <AssociatedGoods ref={modalRef} title={t('关联报价单')} />
    </>
  )
}

export default observer(Filter)
