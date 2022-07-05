import React, { FC, useState } from 'react'
import { observer } from 'mobx-react'
import { Form, Row, Col, Select, Input, Button, Space } from 'antd'

import { Modal } from '@gm-pc/react'
import UploadFile from './upload_file'
import { t } from 'gm-i18n'
import { gmHistory as history } from '@gm-common/router'

import store from '../store'
import PermissionJudge from '@/common/components/permission_judge'
import { Permission } from 'gm_api/src/enterprise'

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
  // 导出
  const handleExport = () => {
    console.log('export')
  }

  const handleLeader = () => {
    Modal.render({
      style: {
        width: '400px',
      },
      title: t('批量导入组合商品'),
      children: <UploadFile />,
    })
  }

  /** 新建商品 */
  const handleCreate = () => {
    history.push('/merchandise/manage/combine/create')
  }

  return (
    <Row className='filter-header'>
      <Col className='gutter-row' span={18}>
        <Form
          onValuesChange={onValuesChange}
          layout='inline'
          initialValues={{ on_sale: '0' }}
          form={form}
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
      <Col className='gutter-row' span={6}>
        <Space size='middle' className='end'>
          {/* <Button onClick={handleLeader}>{t('导入')}</Button> */}
          <Button onClick={handleExport}>{t('导出')}</Button>
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
