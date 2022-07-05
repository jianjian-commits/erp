import React, { FC, useState } from 'react'
import { observer } from 'mobx-react'
import { Form, Row, Col, Select, Input, Button, Space } from 'antd'
import { t } from 'gm-i18n'
import store from '../store'

const Filter: FC = observer(() => {
  const { filter, setFilter } = store
  const [options, setOptions] = useState([
    { label: t('全部状态'), value: '0' },
    { label: t('在售'), value: '1' },
    { label: t('停售'), value: '2' },
  ])
  /** 搜索框取值 */
  const [searchText, setSearchText] = useState<string>('')

  const [form] = Form.useForm()

  /** 输入框搜索按钮 */
  const handleSearch = () => {
    setFilter({
      ...filter,
      q: searchText,
    })
  }

  /** 搜索数据改变 */
  const onValuesChange = (changedValues: any, allValues: any) => {
    if (changedValues.q || changedValues.q === '') {
      setSearchText(changedValues.q)
      return
    }

    setFilter(allValues)
  }

  return (
    <Row style={{ boxSizing: 'border-box', padding: '15px 20px' }}>
      <Col className='gutter-row' span={18}>
        <Form
          onValuesChange={onValuesChange}
          layout='inline'
          form={form}
          initialValues={{ on_sale: '0' }}
        >
          <Form.Item name='on_sale'>
            <Select
              style={{ width: 167 }}
              options={options}
              placeholder={t('请选择销售状态')}
            />
          </Form.Item>
          <Form.Item name='q'>
            <Input.Search
              placeholder={t('请输入商品名称/编码')}
              style={{ minWidth: 120 }}
              allowClear
              enterButton={t('搜索')}
              onSearch={handleSearch}
            />
          </Form.Item>
        </Form>
      </Col>
    </Row>
  )
})

export default Filter
