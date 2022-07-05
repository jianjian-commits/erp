import React, { FC, useState } from 'react'
import { observer } from 'mobx-react'
import { Form, Row, Col, Input, Select } from 'antd'
import { t } from 'gm-i18n'
import store from '../store'
import { list_BomType } from 'gm_api/src/production'

const Filter: FC = observer(() => {
  const { filter, setFilter } = store
  /** 搜索框取值 */
  const [searchText, setSearchText] = useState<string>('')
  const [bomOptions, setBomOptions] = useState([
    { text: t('全部类型'), value: '' },
    ...list_BomType,
  ])

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
          initialValues={{ bom_types: '' }}
        >
          <Form.Item name='q'>
            <Input.Search
              placeholder={t('请输入BOM名称/编码')}
              style={{ minWidth: 120 }}
              enterButton={t('搜索')}
              onSearch={handleSearch}
            />
          </Form.Item>
          <Form.Item name='bom_types'>
            <Select
              style={{ width: 167 }}
              options={bomOptions}
              fieldNames={{ label: 'text' }}
              placeholder={t('请选择BOM类型')}
            />
          </Form.Item>
        </Form>
      </Col>
    </Row>
  )
})

export default Filter
