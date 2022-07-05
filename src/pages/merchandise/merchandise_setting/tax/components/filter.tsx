import React, { useRef } from 'react'
import { observer } from 'mobx-react'
import { t } from 'gm-i18n'
import { Form, Input, Button, Space, message } from 'antd'
import store from '../store'
import globalStore from '@/stores/global'
import CategoryCascader from '@/pages/merchandise/components/category_cascader'
import BatchEditTax, { BatchEditTaxRef } from './batch_edit_tax'

const filterStyle = {
  padding: '16px',
  display: 'flex',
  justifyContent: 'space-between',
}

const initialValues = { quotation_status: 0, quotation_q: '' }

/** 报价单列表Filter */
const Filter = observer(() => {
  const [form] = Form.useForm()

  const modalRef = useRef<BatchEditTaxRef>(null)

  const handleSearch = () => {
    const value = form.getFieldsValue()
    const { category_id } = value

    store.setFilter({
      ...store.filter,
      ...value,
      category_id: category_id ? category_id[category_id.length - 1] : null,
    })
  }

  /** 批量修改税率 */
  const handleBatchEditTax = () => {
    modalRef.current && modalRef.current.handleOpen()
  }

  /** 导出 */
  const handleExport = () => {
    //
    store.export().then(() => {
      globalStore.showTaskPanel()
      // message.success('导出成功')
    })
  }

  return (
    <div style={filterStyle}>
      <Form
        form={form}
        layout='inline'
        onFinish={handleSearch}
        initialValues={initialValues}
      >
        <Form.Item label='' name='category_id'>
          <CategoryCascader
            placeholder={t('请选择所属分类')}
            onChange={handleSearch}
          />
        </Form.Item>
        <Form.Item label='' name='q'>
          <Input.Search
            loading={store.loading}
            placeholder={t('请输入商品名称/别名/编码')}
            style={{ minWidth: 120 }}
            enterButton={t('搜索')}
            onSearch={handleSearch}
          />
        </Form.Item>
      </Form>

      <Space size={16}>
        <Button onClick={handleExport}>{t('导出')}</Button>
        <Button type='primary' onClick={handleBatchEditTax}>
          {t('批量修改税率')}
        </Button>
      </Space>
      <BatchEditTax ref={modalRef} />
    </div>
  )
})

export default Filter
