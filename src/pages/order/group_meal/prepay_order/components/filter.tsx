import React, { useState } from 'react'
import { Form, Row, Col, Select, Input, DatePicker } from 'antd'
import { t } from 'gm-i18n'
import { observer, Observer } from 'mobx-react'
import _ from 'lodash'
import store from '../store'
import moment, { Moment } from 'moment'
import { AdvancedOrder_State } from 'gm_api/src/eshop'
const Filter = () => {
  const { setFilter, updateFilter, setFilterName } = store
  const [options, setOptions] = useState([
    { label: t('全部'), value: AdvancedOrder_State.STATE_UNSPECIFIED },
    { label: t('待付款'), value: AdvancedOrder_State.STATE_WAITING_PAY },
    { label: t('进行中'), value: AdvancedOrder_State.STATE_DOING },
    { label: t('待退款'), value: AdvancedOrder_State.STATE_REFUND },
    { label: t('已完成'), value: AdvancedOrder_State.STATE_COMPLETED },
  ])
  const [date, setData] = useState([
    { label: t('周'), value: 'week' },
    { label: t('月'), value: 'month' },
    { label: t('年'), value: 'year' },
  ])

  const [format, setFormat] = useState('YYYY-wo')

  const [type, setType] = useState<string>('week')

  const handleChange = (value: string) => {
    setType(value)
    if (value === 'week') {
      setFormat('YYYY-wo')
    } else if (value === 'month') {
      setFormat('YYYY-MM')
    } else {
      setFormat('YYYY')
    }
  }

  const handleChangePicker = (dateMoment: Moment | null) => {
    if (dateMoment === null) {
      setFilter('meal_date_start', '')
      setFilter('meal_date_end', '')
    } else {
      setFilter(
        'meal_date_start',
        moment(dateMoment)
          .startOf(type as any)
          .format('YYYY-MM-DD'),
      )
      setFilter(
        'meal_date_end',
        moment(dateMoment)
          .endOf(type as any)
          .format('YYYY-MM-DD'),
      )
    }
    updateFilter()
  }

  const handleChangeInput = (value: string) => {
    setFilterName('q', value || '')
  }

  return (
    <>
      <Form.Item label={t('姓名')}>
        <Observer>
          {() => {
            const q = store.filter.q
            return (
              <Input
                onChange={(value) => handleChangeInput(value.target.value)}
                style={{ width: 167 }}
                placeholder={t('请输入姓名')}
                value={q}
              />
            )
          }}
        </Observer>
      </Form.Item>
      <Form.Item label={t('订餐日期')}>
        <Row gutter={10}>
          <Col span={8}>
            <Form.Item name='cycle' initialValue='week'>
              <Select
                value={type}
                onChange={(value) => handleChange(value)}
                options={date}
                allowClear={false}
              />
            </Form.Item>
          </Col>
          <Col span={16}>
            <Form.Item name='date'>
              <Observer>
                {() => {
                  const meal_date_start = store.filter.meal_date_start
                  console.log('meal_date_start', meal_date_start)
                  return (
                    <DatePicker
                      onChange={(dateMoment) => handleChangePicker(dateMoment)}
                      value={
                        meal_date_start === '' ? null : moment(meal_date_start)
                      }
                      format={format}
                      picker={type as any}
                    />
                  )
                }}
              </Observer>
              {/* format需要变 */}
            </Form.Item>
          </Col>
        </Row>
      </Form.Item>
      <Form.Item
        name='states'
        label={t('状态')}
        initialValue={AdvancedOrder_State.STATE_UNSPECIFIED}
      >
        <Select
          style={{ width: 120 }}
          options={options}
          placeholder={t('请选择状态')}
        />
      </Form.Item>
    </>
  )
}
export default observer(Filter)
