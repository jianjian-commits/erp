/**
 * @description 个人中心
 */
import React, { useCallback, useEffect, useLayoutEffect, useRef } from 'react'
import { Button, Card, Form, Input, Modal } from 'antd'
import { observer } from 'mobx-react'
import store from '../store'
import ChangePassword from './changePassword'
import { gmHistory } from '@gm-common/router'
import { Flex } from '@gm-pc/react'
import { useBoolean } from '@/common/hooks'
import WeQrCode, { WeQrCodeRef } from './we_qr_code'
import OptionWechat from './option_wechat'
import { ExclamationCircleOutlined } from '@ant-design/icons'
import { t } from 'gm-i18n'

const PersonalDetail = observer(() => {
  const {
    isModalVisible,
    setIsModalVisible,
    getGroupUser,
    personalCenterGroupUser: { name, phone, username },
    getUserInfo,
    wechatUserInfo,
    handleWechatToAccount,
  } = store

  const { state, setTrue, setFalse } = useBoolean(
    !!wechatUserInfo.wechat_unionid,
  )

  const qrCodeRef = useRef<WeQrCodeRef>(null)
  const timerRef = useRef<NodeJS.Timer | null>(null)

  const handleChangePassword = () => {
    setIsModalVisible()
  }

  const backUp = useCallback(() => {
    clearInterval(timerRef.current as NodeJS.Timer)
    timerRef.current = null
  }, [])

  useEffect(() => {
    getGroupUser()
    getUserInfo()

    sessionStorage.removeItem('passport__wechatwork_verify_code')
    timerRef.current = setInterval(() => {
      console.log('timer is working')
      const code = qrCodeRef.current && qrCodeRef.current.getCode()
      const appId = qrCodeRef.current && qrCodeRef.current.getAppId()
      if (code) {
        handleWechatToAccount('bind', appId!, code, backUp)
      }
    }, 1000)
    return backUp
  }, [])

  useEffect(() => {
    console.log(wechatUserInfo.wechat_unionid, !!wechatUserInfo.wechat_unionid)
    wechatUserInfo.wechat_unionid ? setTrue() : setFalse()
  }, [wechatUserInfo.wechat_unionid])

  const formLayout = {
    labelCol: { span: 3 },
    wrapperCol: { span: 4 },
  }

  const unbindWechatToAccount = () => {
    Modal.confirm({
      title: '提示',
      icon: <ExclamationCircleOutlined />,
      content: (
        <div>
          {t('请确认是否解除绑定？')}
          <br />
          {t('解除绑定后将不能再使用微信扫码登录')}
        </div>
      ),
      okText: t('确定'),
      cancelText: t('取消'),
      onOk: () => handleWechatToAccount('unbind', '', '', backUp),
    })
  }

  return (
    <>
      <Card title='个人中心' bordered={false}>
        <Flex justifyCenter>
          <div className='b-form-base'>
            <Form name='basic-personal-detail' {...formLayout}>
              <Form.Item label='姓名'>
                <Input disabled value={name} />
              </Form.Item>
              <Form.Item label='手机'>
                <Input disabled value={phone} />
              </Form.Item>
              <Form.Item label='登录账号'>
                <Input disabled value={username} />
              </Form.Item>
              <Form.Item label='登录密码' name='password'>
                <a onClick={handleChangePassword}>修改密码</a>
              </Form.Item>
            </Form>
          </div>
          <div className='b-line-separation' />
          {state ? (
            <OptionWechat
              wechat_avatar={wechatUserInfo.wechat_avatar}
              wechat_nickname={wechatUserInfo.wechat_nickname}
              unbindWechatToAccount={unbindWechatToAccount}
            />
          ) : (
            <WeQrCode
              elementId='wechat_bind_container'
              type='verify'
              onRef={qrCodeRef}
            />
          )}
        </Flex>
      </Card>

      <div className='b-personal-detail-position'>
        <Button
          onClick={() => {
            gmHistory.go(-1)
          }}
        >
          返回
        </Button>
      </div>

      <Modal
        title='修改密码'
        visible={isModalVisible}
        onCancel={setIsModalVisible}
        footer={null}
        bodyStyle={{ paddingBottom: '64px' }}
      >
        <ChangePassword />
      </Modal>
    </>
  )
})

export default PersonalDetail
