import React, { FC, useEffect, useState } from 'react'
import { observer } from 'mobx-react'
import { Form, Row, Col, Select, Input } from 'antd'
import { t } from 'gm-i18n'
import store from '../store'
import { DateRangePicker } from '@gm-pc/react'
import moment from 'moment'
import { list_LogModelType, LogModelType } from 'gm_api/src/logsystem'
import _ from 'lodash'

const Filter: FC = observer(() => {
  const { filter, setFilter } = store

  /** 搜索框取值 */
  const [searchText, setSearchText] = useState<string>('')

  const [options, setOptions] = useState([
    { value: '', text: '全部类型' },
    { value: LogModelType.LOGMODELTYPE_SKU, text: '商品日志' },
    { value: LogModelType.LOGMODELTYPE_COMBINE_SKU, text: '组合商品日志' },
    { value: LogModelType.LOGMODELTYPE_QUOTATION, text: '报价单日志' },
    { value: LogModelType.LOGMODELTYPE_ORDER, text: '订单日志' },
    { value: LogModelType.LOGMODELTYPE_ACCOUNT, text: '账户日志' },
  ])

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
    <Row style={{ boxSizing: 'border-box', padding: '15px 20px' }}>
      <Col className='gutter-row' span={18}>
        <Form
          onValuesChange={onValuesChange}
          layout='inline'
          form={form}
          initialValues={{ log_model_type: '' }}
        >
          <Form.Item name='log_model_type'>
            <Select
              style={{ width: 167 }}
              options={options}
              fieldNames={{ label: 'text' }}
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
