import React, { useEffect } from 'react'
import { DatePicker, Form, Select, Button, Card, message, Row, Col } from 'antd'
import { history } from '@/common/service'
import { t } from 'gm-i18n'
import moment, { Moment } from 'moment'
import { TERM_OPTIONS_TYPE } from '../../../enum'
import {
  CreateSemester,
  SemesterType,
  Status_Code,
} from 'gm_api/src/enterprise'

interface ValuesProps {
  year: Moment
  semester_type: SemesterType
  date: [Moment, Moment]
}

const { RangePicker } = DatePicker

const Detail = () => {
  const [form] = Form.useForm()

  const _handleCreate = (values: ValuesProps) => {
    console.warn('onOk', values)
    const req = {
      semester_type: values.semester_type,
      year: moment(values.year).format('YYYY'),
      start_time: +moment(values.date[0]).startOf('d') + '',
      end_time: +moment(values.date[1]).endOf('d') + '',
    }
    CreateSemester(
      {
        semester: req,
      },
      [Status_Code.DUPLICATE_SEMESTER, Status_Code.SEMESTER_TIME_OVERLAP],
    )
      .then((json) => {
        if (json.code === Status_Code.SEMESTER_TIME_OVERLAP) {
          message.error(t('学期期间不能有交集，请重新选择!'))
          throw new Error(t('学期期间不能有交集，请重新选择!'))
        }
        if (json.code === Status_Code.DUPLICATE_SEMESTER) {
          message.error(t('该学期已存在！'))
          throw new Error(t('该学期已存在!'))
        }
        if (json.response.semester) {
          history.goBack()
          message.success('保存成功！')
        }
        return null
      })
      .catch((e) => {
        return new Error(e)
      })
  }

  // 禁用year学年以外的时间（可能有跨年情况）
  const handleDisabledDate = (current: Moment) => {
    const yearValue = +moment(form.getFieldValue('year')).format('YYYY')
    const currentValue = +moment(current).format('YYYY')
    return yearValue > currentValue
  }

  useEffect(() => {
    return form.resetFields()
  }, [])

  return (
    <Card
      title={t('新建学期')}
      bordered
      style={{
        borderBottom: 0,
      }}
    >
      <Form
        form={form}
        name='create_term'
        labelCol={{ span: 2 }}
        wrapperCol={{ span: 8 }}
        initialValues={{
          year: moment(),
          semester_type: SemesterType.SEMESTER_TYPE_SPRING,
          date: [
            moment().subtract(1, 'month').startOf('month'),
            moment().endOf('month'),
          ],
        }}
        onFinish={(values) => _handleCreate(values)}
        onFinishFailed={(values) => {
          console.log('onError', values)
        }}
      >
        <Form.Item
          label={t('学年')}
          name='year'
          rules={[{ required: true, message: t('学年不为空！') }]}
        >
          <DatePicker
            picker='year'
            style={{
              width: 120,
            }}
            // disabledDate={(current: Moment) =>
            //   +moment(current).format('YYYY') < +moment().format('YYYY')
            // }
            // 设置起止日期的年份
            onPanelChange={(value) => {
              form.setFieldsValue({
                date: [value, value],
              })
            }}
          />
        </Form.Item>
        <Form.Item
          label={t('学期')}
          name='semester_type'
          rules={[{ required: true, message: '学期不为空！' }]}
        >
          <Select style={{ width: 120 }} options={TERM_OPTIONS_TYPE} />
        </Form.Item>
        <Form.Item
          label={t('起止日期')}
          name='date'
          rules={[{ required: true, message: '起止日期不为空！' }]}
        >
          <RangePicker
          // disabledDate={handleDisabledDate}
          />
        </Form.Item>
        <Row justify='center'>
          <Col>
            <Button
              onClick={() => {
                history.goBack()
              }}
            >
              {t('取消')}
            </Button>
            <Button
              type='primary'
              htmlType='submit'
              className='gm-margin-left-10'
            >
              {t('保存')}
            </Button>
          </Col>
        </Row>
      </Form>
    </Card>
  )
}

export default Detail
