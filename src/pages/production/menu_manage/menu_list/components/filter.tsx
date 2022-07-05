import React, { useState } from 'react'
import { t } from 'gm-i18n'
import { observer } from 'mobx-react'
import store from '../store'
import { menuStatus, menuStatusEnum } from '../enum'
import { Row, Col, Form, Select, Space, Input, Button } from 'antd'
import _ from 'lodash'
import globalStore from '@/stores/global'
import { Permission } from 'gm_api/src/enterprise'

const Filter = () => {
  const [options, setOptions] = useState(menuStatus)
  const { filter, updateFilter, setSearchText } = store
  const [form] = Form.useForm()

  const onValuesChange = (changedValues: any, allValues: any) => {
    if (changedValues.q !== undefined) {
      setSearchText(changedValues.q)
      return
    }
    updateFilter({ ...filter, ...allValues })
  }

  const handleSearch = () => {
    updateFilter({ ...filter })
  }

  const handleCreate = () => {
    window.open(`#/production/menu_manage/menu_list/create_menu`)
  }
  return (
    <>
      <Row className='filter-header'>
        <Col className='gutter-row' span={18}>
          <Form
            onValuesChange={onValuesChange}
            layout='inline'
            initialValues={{ is_active: menuStatusEnum.All }}
            form={form}
          >
            <Form.Item name='is_active'>
              <Select
                style={{ width: 167 }}
                options={options}
                placeholder={t('请选择菜谱状态')}
              />
            </Form.Item>
            <Form.Item name='q'>
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
            {/* <Button onClick={handleLeader}>{t('导入')}</Button> */}
            <Button
              type='primary'
              onClick={handleCreate}
              disabled={
                !globalStore.hasPermission(
                  Permission.PERMISSION_MERCHANDISE_CREATE_MENU,
                )
              }
            >
              {t('新建')}
            </Button>
          </Space>
        </Col>
      </Row>
    </>
  )
}

export default observer(Filter)
