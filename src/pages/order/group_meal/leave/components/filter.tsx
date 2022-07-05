import React from 'react'
import { observer } from 'mobx-react'
import { Row, Col, Form, Cascader, Space, Input, Button } from 'antd'
import { DateRangePicker } from '@gm-pc/react'
import { t } from 'gm-i18n'
import store from '../store'
import _ from 'lodash'
import moment from 'moment'

const Filter = () => {
  const [form] = Form.useForm()
  const { leave_date_start, leave_date_end } = store.filter
  const onValuesChange = (changedValues: any) => {
    if (changedValues.student_name !== undefined) {
      store.setFilterName(changedValues.student_name)
      return
    }
    if (changedValues.school === undefined || changedValues.school) {
      const parmas = {
        ...store.filter,
        school_id: changedValues.school?.[0] || '0',
        class_id: changedValues.school?.[1] || '0',
      }
      store.setFilter(parmas)
    } else {
      const parmas = {
        ...store.filter,
        ...changedValues,
      }
      store.setFilter(parmas)
    }
  }

  const handleChange = (begin: Date | null, end: Date | null) => {
    const parmas = {
      ...store.filter,
      leave_date_start: '' + moment(begin).toDate().getTime(),
      leave_date_end: '' + moment(end).toDate().getTime(),
    }
    store.setFilter(parmas)
  }
  return (
    <Row className='filter-header'>
      <Col className='gutter-row' span={20}>
        <Form onValuesChange={onValuesChange} layout='inline' form={form}>
          <Form.Item name='school'>
            <Cascader
              changeOnSelect
              expandTrigger='hover'
              style={{ width: '240px' }}
              options={store.customers}
              placeholder='全部班级'
            />
          </Form.Item>
          <Form.Item label={t('学生')} name='student_name'>
            <Input
              placeholder={t('请选择学生')}
              allowClear
              style={{ width: '130px' }}
            />
          </Form.Item>
          <Form.Item label={t('请假日期')}>
            <DateRangePicker
              begin={
                !leave_date_start ? null : moment(+leave_date_start!).toDate()
              }
              end={!leave_date_end ? null : moment(+leave_date_end!).toDate()}
              onChange={(begin, end) => handleChange(begin, end)}
              style={{ width: '300px' }}
              enabledTimeSelect
            />
          </Form.Item>
        </Form>
      </Col>
      <Col className='gutter-row' span={4}>
        <Space size='middle' className='end'>
          <Button type='primary' onClick={() => store.setFilter(store.filter)}>
            {t('搜索')}
          </Button>

          <Button onClick={store.exportLeave}>{t('导出')}</Button>
        </Space>
      </Col>
    </Row>
  )
}
export default observer(Filter)
