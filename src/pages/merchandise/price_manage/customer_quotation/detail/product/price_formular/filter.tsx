import { formatCascaderData } from '@/common/util'
import { Button, Cascader, Form, Input, Select, Space } from 'antd'
import { t } from 'gm-i18n'
import { observer } from 'mobx-react'
import React, { FC, useEffect } from 'react'
import store from './store'

type FilterType = {
  q: string
  on_shelf: number
  category_id: string
}

const filterStyle = {
  padding: '0 0 16px 0',
  borderBottom: '1px solid rgba(0, 0, 0, 0.07)',
  display: 'flex',
  justifyContent: 'space-between',
}

const initialValues = { q: '', category_id: ['00'] }

/**
 * @description: 筛选组件
 */
const PriceFormularFilter: FC = () => {
  const { loading, treeData, setFilter, getTreeData } = store

  useEffect(() => {
    getTreeData()
  }, [])
  const [form] = Form.useForm()

  const handleSearch = () => {
    const value = form.getFieldsValue()
    const { category_id } = value
    setFilter({
      ...value,
      category_id: category_id[category_id.length - 1] || '',
    })
  }

  return (
    <div style={filterStyle}>
      <Form<FilterType>
        form={form}
        name='merchandise-manage-sale'
        layout='inline'
        onFinish={handleSearch}
        initialValues={initialValues}
      >
        <Form.Item name='category_id'>
          <Cascader
            style={{ width: '200px' }}
            expandTrigger='hover'
            changeOnSelect
            allowClear={false}
            options={[
              {
                label: '全部分类',
                value: '00',
              },
              ...formatCascaderData(treeData),
            ]}
            onChange={handleSearch}
          />
        </Form.Item>
        <Form.Item name='q'>
          <Input.Search
            placeholder={t('请输入商品名称/编码')}
            style={{ minWidth: 120 }}
            enterButton={t('搜索')}
            onSearch={handleSearch}
            loading={loading}
          />
        </Form.Item>
      </Form>
    </div>
  )
}

export default observer(PriceFormularFilter)
