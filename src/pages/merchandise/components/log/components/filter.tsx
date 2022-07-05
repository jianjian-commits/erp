import React, { FC, useState } from 'react'
import { observer } from 'mobx-react'
import { Form, Row, Col, Select, Input } from 'antd'
import { t } from 'gm-i18n'
import store from '../store'
import { DateRangePicker } from '@gm-pc/react'
import moment from 'moment'
import { MerchandiseLogConfig } from '../config'

const Filter: FC = observer(() => {
  const { type, filter, setFilter } = store

  /** 搜索框取值 */
  const [searchText, setSearchText] = useState<string>('')

  const [form] = Form.useForm()

  /** 输入框搜索按钮 */
  const handleSearch = () => {
    setFilter({
      ...filter,
      user_name: searchText,
    })
  }

  /** 搜索数据改变 */
  const onValuesChange = (changedValues: any, allValues: any) => {
    if (changedValues.time) {
      return
    }
    if (changedValues.user_name || changedValues.user_name === '') {
      setSearchText(changedValues.user_name)
      return
    }

    setFilter({ ...filter, ...allValues })
  }

  /** 时间选择改变 */
  const onTimeChange = (begin: Date, end: Date) => {
    console.log(begin, end)
    const newFilter = {
      ...filter,
      begin_time: moment(begin).valueOf(),
      end_time: moment(end).valueOf(),
    }
    store.setFilter(newFilter)
  }

  return (
    <Row style={{ boxSizing: 'border-box', padding: '18px' }}>
      <Col className='gutter-row' span={18}>
        <Form
          onValuesChange={onValuesChange}
          layout='inline'
          form={form}
          initialValues={{ operation_type: '' }}
        >
          <Form.Item name='operation_type'>
            <Select
              style={{ width: 167 }}
              options={MerchandiseLogConfig[type]?.operationTypeList || []}
              placeholder={t('请选择操作类型')}
            />
          </Form.Item>
          <Form.Item name='time'>
            <DateRangePicker
              className='antd-gm-date-picker'
              begin={moment(Number(filter.begin_time)).toDate()}
              end={moment(Number(filter.end_time)).toDate()}
              onChange={onTimeChange}
              enabledTimeSelect
            />
          </Form.Item>
          <Form.Item name='user_name'>
            <Input.Search
              placeholder={t('请输入操作人名称')}
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
