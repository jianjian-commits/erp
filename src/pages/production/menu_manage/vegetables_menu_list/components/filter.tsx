import React, { FC, useState } from 'react'
import { observer } from 'mobx-react'
import { Form, Row, Col, Select, Input, Button, Space } from 'antd'
import { t } from 'gm-i18n'
import { gmHistory as history } from '@gm-common/router'

import store from '../store'
import PermissionJudge from '@/common/components/permission_judge'
import { Permission } from 'gm_api/src/enterprise'
import { menu_status } from '@/pages/production/menu_manage/vegetables_menu_list/enum'

const Filter: FC = observer(() => {
  const { filter, setFilter } = store

  /** 搜索框取值 */
  const [searchText, setSearchText] = useState<string>('')

  const [form] = Form.useForm()

  /** 输入框搜索按钮 */
  const handleSearch = () => {
    setFilter({
      ...filter,
      quotation_q: searchText,
    })
  }

  /** 搜索数据改变 */
  const onValuesChange = (changedValues: any, allValues: any) => {
    if (changedValues.quotation_q || changedValues.quotation_q === '') {
      setSearchText(changedValues.quotation_q)
      return
    }

    setFilter(allValues)
  }

  /** 新建菜谱 */
  const handleCreate = () => {
    history.push(
      '/production/menu_manage/vegetables_menu_list/create_quotation',
    )
  }

  return (
    <Row className='filter-header'>
      <Col className='gutter-row' span={18}>
        <Form
          onValuesChange={onValuesChange}
          layout='inline'
          initialValues={{ quotation_status: 0 }}
          form={form}
        >
          <Form.Item name='quotation_status'>
            <Select
              style={{ width: 167 }}
              options={menu_status}
              placeholder={t('请选择菜谱状态')}
            />
          </Form.Item>
          <Form.Item name='quotation_q'>
            <Input.Search
              placeholder={t('请输入菜谱名称/编码')}
              style={{ minWidth: 120 }}
              allowClear
              enterButton={t('搜索')}
              onSearch={handleSearch}
            />
          </Form.Item>
        </Form>
      </Col>
      <Col className='gutter-row' span={6}>
        <Space size='middle' className='end'>
          <PermissionJudge
            permission={Permission.PERMISSION_PRODUCTION_CREATE_COMBINE_SSU}
          >
            <Button type='primary' onClick={handleCreate}>
              {t('新建')}
            </Button>
          </PermissionJudge>
        </Space>
      </Col>
    </Row>
  )
})

export default Filter
