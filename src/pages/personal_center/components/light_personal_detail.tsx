/**
 * @description 轻巧版个人中心
 */
import React, { useEffect } from 'react'
import { Button, Card, Form, Input } from 'antd'
import { observer } from 'mobx-react'
import { i18next } from 'gm-i18n'
import store from '../store'
import { gmHistory } from '@gm-common/router'
import { Tip } from '@gm-pc/react'

const LightPersonalDetail = observer(() => {
  const {
    getGroupUser,
    personalCenterGroupUser: { name, phone },
  } = store

  useEffect(() => {
    getGroupUser()
  }, [])
  const formLayout = {
    labelCol: { span: 3 },
    wrapperCol: { span: 4 },
  }

  const handleSubmit = () => {
    store.updateGroupUser().then(() => Tip.success(i18next.t('修改成功')))
  }

  return (
    <>
      <Card title={i18next.t('个人中心')} bordered={false}>
        <Form name='basic-personal-detail' {...formLayout}>
          <Form.Item label={i18next.t('姓名')}>
            <Input
              value={name}
              onChange={(e) => store.updateFromInfo('name', e.target.value)}
            />
          </Form.Item>
          <Form.Item label={i18next.t('手机')}>
            <Input
              value={phone}
              onChange={(e) => store.updateFromInfo('phone', e.target.value)}
            />
          </Form.Item>
        </Form>
      </Card>

      <div className='b-personal-detail-position'>
        <Button
          onClick={() => {
            gmHistory.go(-1)
          }}
        >
          返回
        </Button>
        <Button
          type='primary'
          className='gm-margin-left-10'
          onClick={handleSubmit}
        >
          {i18next.t('确认')}
        </Button>
      </div>
    </>
  )
})

export default LightPersonalDetail
