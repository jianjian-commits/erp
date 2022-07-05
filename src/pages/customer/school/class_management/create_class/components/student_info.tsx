import React, { useEffect, forwardRef, useImperativeHandle } from 'react'
import { FormPanel } from '@gm-pc/react'
import { Table, Input, Form } from 'antd'
import { t } from 'gm-i18n'
import { ColumnsType } from 'antd/lib/table'
import TableTotalText from '@/common/components/table_total_text'
import { useGMLocation } from '@gm-common/router'
import store from '../store'
import { Observer, observer } from 'mobx-react'
import { StudentRef, StudentList, StudentProps } from '../interface'
import { handleScrollIntoView } from '@/pages/merchandise/util'
import _ from 'lodash'
const StudentInfo = observer(
  forwardRef<StudentRef, StudentProps>(({ is_look }, studentRef) => {
    const [form] = Form.useForm()
    const location = useGMLocation<{ class_id: string; customer_id: string }>()
    const { student_list, count, updateList } = store
    useEffect(() => {
      if (location.query.class_id) {
        store.getListStudent(location.query.class_id).then((json) => {
          form.setFieldsValue({
            student: _.map(json.students, (item) => {
              return {
                name: item.name,
                parent_name: item.parent_phone,
                parent_phone: item.parent_phone,
              }
            }),
          })
        })
      }
    }, [])

    const columns: ColumnsType<StudentList> = [
      {
        title: t('序号'),
        dataIndex: 'index',
        key: 'index',
        align: 'center',
        render: (value, record, index) => {
          return index + 1
        },
      },
      {
        title: t('学生姓名'),
        dataIndex: 'name',
        key: 'name',
        align: 'center',
        width: 150,
        render: (__, record, index) => {
          if (is_look) {
            return (
              <a onClick={() => handlePushOrder(record.name!)}>
                {record?.name || '-'}
              </a>
            )
          }
          return (
            <Form.Item
              name={['student', index, 'name']}
              rules={[{ required: true, message: '请输入学生姓名' }]}
            >
              <Observer>
                {() => {
                  const value = record.name || ''
                  return (
                    <Input
                      value={value}
                      onChange={(value) =>
                        handleChange(value.target.value, index, 'name')
                      }
                    />
                  )
                }}
              </Observer>
            </Form.Item>
          )
        },
      },
      {
        title: t('家长姓名'),
        dataIndex: 'parent_name',
        key: 'parent_name',
        align: 'center',
        width: 150,
        render: (__, record, index) => {
          if (is_look) {
            return <>{record?.parent_name || '-'}</>
          }
          return (
            <Form.Item
              name={['student', index, 'parent_name']}
              rules={[{ required: true, message: '请输入家长姓名' }]}
            >
              <Observer>
                {() => {
                  const value = record.parent_name || ''
                  return (
                    <Input
                      value={value}
                      onChange={(value) => {
                        handleChange(value.target.value, index, 'parent_name')
                      }}
                    />
                  )
                }}
              </Observer>
            </Form.Item>
          )
        },
      },
      {
        title: t('家长联系方式'),
        dataIndex: 'parent_phone',
        key: 'parent_phone',
        align: 'center',
        width: 180,
        render: (__, record, index) => {
          if (is_look) {
            return <>{record?.parent_phone || '-'}</>
          }
          return (
            <Form.Item
              name={['student', index, 'parent_phone']}
              rules={[{ required: true, message: '请输入家长联系方式' }]}
            >
              <Observer>
                {() => {
                  const value = record.parent_phone! || ''
                  return (
                    <Input
                      value={value}
                      onChange={(value) => {
                        handleChange(value.target.value, index, 'parent_phone')
                      }}
                    />
                  )
                }}
              </Observer>
            </Form.Item>
          )
        },
      },
      {
        title: t('学校'),
        dataIndex: 'school_name',
        key: 'school_name',
        align: 'center',
        render: (__, record, index) => (
          <Observer>
            {() => {
              const value = record.school_name! || '-'
              return <>{value}</>
            }}
          </Observer>
        ),
      },
      {
        title: t('班级'),
        dataIndex: 'class_name',
        key: 'class_name',
        align: 'center',
        render: (__, record, index) => (
          <Observer>
            {() => {
              const value = record.class_name! || '-'
              return <>{value}</>
            }}
          </Observer>
        ),
      },
    ]

    const handleChange = (value: string, index: number, key: string) => {
      updateList(value, index, key)
      const formValue = form.getFieldsValue().student
      _.set(formValue[index], key, value)
      form.setFieldsValue({
        student: formValue,
      })
    }

    const handlePushOrder = (name: string) => {
      window.open(`#/order/group_meal/prepay_order?q=${name}`)
    }

    const validateFieldFn = async (): Promise<Record<string, any>> => {
      console.log(form.getFieldsValue().student)
      const result = await form
        .validateFields()
        .then((res) => {
          return res
        })
        .catch((err) => {
          const id = err.errorFields[0].name.join('_')
          handleScrollIntoView(id)
          return err
        })
      console.log(result)
      return result
    }

    useImperativeHandle(studentRef, () => ({
      validateFieldFn,
    }))

    return (
      <FormPanel title={t('学生信息')} style={{ padding: '0 20px' }}>
        <div className='student-info-title'>
          <TableTotalText
            data={[
              {
                label: t('学生总数'),
                content: count,
              },
            ]}
          />
        </div>
        <Form form={form} className='student-ant-form-table'>
          <Table
            columns={columns}
            dataSource={student_list}
            className='student-info-table'
            rowKey={(record) => record.key}
            pagination={false}
          />
        </Form>
      </FormPanel>
    )
  }),
)
export default StudentInfo
