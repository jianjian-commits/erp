import React, { FC } from 'react'
import { observer } from 'mobx-react'
import { t } from 'gm-i18n'
import store from '../store'
import { Form, Button, Input, Row, Space } from 'antd'
import CategoryCascader from '@/pages/merchandise/components/category_cascader'
import { gmHistory as history } from '@gm-common/router'
import PermissionJudge from '@/common/components/permission_judge'
import { Permission } from 'gm_api/src/enterprise'
import { Sku_SkuType } from 'gm_api/src/merchandise'

const Filter: FC = observer(() => {
  const handleExport = (): void => {
    console.log('导出')
  }

  const handleCreate = (): void => {
    history.push('/merchandise/manage/wrapper/sku_detail')
  }

  const filterStyle = {
    padding: '16px',
    display: 'flex',
    justifyContent: 'space-between',
  }

  const [form] = Form.useForm()

  // 改变Cascader或search input 都会同时改变两个filter选项(category, wrapper_q)
  const handleFilterChange = () => {
    const { q, category_id } = form.getFieldsValue()

    store.setFilter({
      ...store.filter,
      q: q || '',
      category_id: category_id ? category_id[category_id.length - 1] : null,
    })
  }

  return (
    <div style={filterStyle}>
      <Form form={form} layout='inline'>
        <Form.Item name='category_id'>
          <CategoryCascader onChange={handleFilterChange} />
        </Form.Item>
        <Form.Item label='' name='q'>
          <Input.Search
            loading={store.loading}
            placeholder={t('请输入商品名称/编码')}
            style={{ minWidth: 120 }}
            enterButton={t('搜索')}
            onSearch={handleFilterChange}
          />
        </Form.Item>
      </Form>
      <Row justify='end'>
        <Space size={16}>
          <Button type='default' onClick={handleExport}>
            {t('导出')}
          </Button>

          <PermissionJudge
            permission={
              Permission.PERMISSION_MERCHANDISE_CREATE_PACKAGE_SKU_SSU
            }
          >
            <Button type='primary' onClick={handleCreate}>
              {t('新建')}
            </Button>
          </PermissionJudge>
        </Space>
      </Row>
    </div>
  )
})

export default Filter
