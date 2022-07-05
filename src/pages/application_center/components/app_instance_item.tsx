import React, { useState } from 'react'
import { observer } from 'mobx-react'
import { Flex, Tip } from '@gm-pc/react'
import { Button, Form, Image, Input, Modal } from 'antd'
import {
  AppInstance_AppStatus,
  ResourceConfig_ConfigType,
  ResourceConfig_IsNull,
} from 'gm_api/src/application'
import { formatDate } from '@/common/util'
import store from '../store'

const { Item } = Form

function AppInstanceItem({ index }: { index: number }) {
  const appInstance = store.appInstancelist[index]
  const { icon_url, header, expiration_time, data, app_status } = appInstance
  const [visible, setVisible] = useState(false)
  const [form] = Form.useForm()

  const isAuthorize = app_status === AppInstance_AppStatus.APP_STATUS_AVAILABLE
  const isExpired = app_status === AppInstance_AppStatus.APP_STATUS_EXPIRED
  const isNotAuthorize = [
    AppInstance_AppStatus.APP_STATUS_CLOSED,
    AppInstance_AppStatus.APP_STATUS_UNAVAILABLE,
  ].includes(app_status!)
  let text = '应用已授权'
  if (isExpired) text = '应用已过期，请重新授权'
  if (isNotAuthorize) text = '当前应用暂未授权'
  const onAuthorize = () => {
    form.validateFields().then((values) => {
      data?.app_configs!.forEach((item) => {
        const { key } = item
        if (item.config_type === ResourceConfig_ConfigType.CONFIG_TYPE_USER) {
          item.val = values[key!] || ''
        }
      })
      store
        .updateAppInstance({
          ...appInstance,
          data,
          app_status: AppInstance_AppStatus.APP_STATUS_AVAILABLE,
        })
        .then(() => {
          Tip.success('授权成功')
          setVisible(false)
          store.getAppInstanceList()
        })
    })
  }
  return (
    <>
      <Flex
        alignCenter
        className='gm-application-center-instance-item'
        onClickCapture={() => {
          setVisible(true)
        }}
      >
        <Image
          className='gm-application-center-instance-item-image'
          src={icon_url!}
          width={72}
          height={72}
          preview={false}
        />
        <Flex
          alignCenter
          justifyBetween
          flex
          className='gm-application-center-instance-item-right'
        >
          <Flex justifyBetween column>
            <div className='gm-application-center-instance-item-right-header'>
              {header}
            </div>
            <div>{text}</div>
            {isAuthorize && (
              <div>到期时间: {formatDate(+expiration_time!)}</div>
            )}
          </Flex>
          {!isAuthorize && (
            <Button
              type='primary'
              onClick={(e) => {
                e.stopPropagation()
                setVisible(true)
              }}
            >
              授权
            </Button>
          )}
        </Flex>
      </Flex>
      <Modal
        title={header}
        visible={visible}
        onCancel={() => {
          setVisible(false)
          form.resetFields()
        }}
        okText='授权'
        onOk={onAuthorize}
        destroyOnClose
        centered
        bodyStyle={{ overflowY: 'auto', height: '70vh' }}
      >
        <Form labelCol={{ span: 6 }} wrapperCol={{ span: 18 }} form={form}>
          {data?.app_configs
            ?.filter(
              (item) =>
                item.config_type === ResourceConfig_ConfigType.CONFIG_TYPE_USER,
            )
            .map((appConfig) => {
              const { name, key, val, is_null } = appConfig
              const required = is_null === ResourceConfig_IsNull.IS_NULL_FALSE
              return (
                <Item
                  required={required}
                  // @ts-ignore
                  rules={[
                    required && { required: true, message: '请输入' + name },
                  ].filter(Boolean)}
                  key={key}
                  label={name}
                  initialValue={val}
                  name={key}
                >
                  <Input />
                </Item>
              )
            })}
        </Form>
      </Modal>
    </>
  )
}

export default observer(AppInstanceItem)
