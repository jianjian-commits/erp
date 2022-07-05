/**
 * @description 个人中心-修改密码弹窗
 */
import React from 'react'
import { Form, Input } from 'antd'
import { observer } from 'mobx-react'
import store from '../store'
import ButtonGroupFixed from '@/common/components/button_group_fixed'

const ChangePassword = observer(() => {
  const { passwordObj, handleSubmit, setIsModalVisible, loading } = store
  const formLayout = {
    labelCol: { span: 6 },
    wrapperCol: { span: 16 },
  }

  return (
    <Form
      name='basic-change-password'
      {...formLayout}
      onFinish={handleSubmit}
      initialValues={passwordObj}
    >
      <Form.Item
        label='旧密码'
        name='origin_password'
        rules={[{ required: true, message: '请输入旧密码!' }]}
      >
        <Input.Password />
      </Form.Item>
      <Form.Item
        label='新密码'
        name='password'
        rules={[
          { required: true, message: '请输入新密码!' },
          () => ({
            validator(_, value) {
              if (/[\u4E00-\u9FA5]/.test(value)) {
                return Promise.reject(new Error('不可以输入中文！'))
              }
              return Promise.resolve()
            },
          }),
        ]}
      >
        <Input.Password />
      </Form.Item>
      <Form.Item
        label='再次输入新密码'
        name='rePassword'
        rules={[
          { required: true, message: '请再次输入新密码!' },
          ({ getFieldValue }) => ({
            validator(_, value) {
              if (!value || getFieldValue('password') === value) {
                return Promise.resolve()
              }
              return Promise.reject(new Error('两次输入密码不一致!'))
            },
          }),
        ]}
      >
        <Input.Password />
      </Form.Item>
      <ButtonGroupFixed
        onCancel={setIsModalVisible}
        right
        loading={loading}
        absolute
      />
    </Form>
  )
})
export default ChangePassword
