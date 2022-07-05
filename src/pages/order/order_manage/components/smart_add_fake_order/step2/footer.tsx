import React from 'react'
import { Button, Modal, Space } from 'antd'
import { t } from 'gm-i18n'
import _ from 'lodash'
import leaveConfirm from '../leave_confirm'

export interface FooterProps {
  onCancel?: React.MouseEventHandler<HTMLElement>
  onPrev?: React.MouseEventHandler<HTMLElement>
  onOk?: React.MouseEventHandler<HTMLElement>
}

const Footer: React.VFC<FooterProps> = (props) => {
  const { onCancel, onOk, onPrev } = props

  const handlePrev: React.MouseEventHandler<HTMLElement> = (e) => {
    Modal.confirm({
      title: t('提示'),
      content: t('返回上一步后已填写的信息将会失效，确定要离开？'),
      cancelText: '上一步',
      okText: '继续填写',
      onCancel: () => {
        if (_.isFunction(onPrev)) {
          onPrev(e)
        }
      },
    })
  }

  const handleCancel: React.MouseEventHandler<HTMLElement> = (e) => {
    leaveConfirm({
      onCancel: () => {
        if (_.isFunction(onCancel)) {
          onCancel(e)
        }
      },
    })
  }

  return (
    <Space size={16}>
      <Button onClick={handleCancel}>{t('取消')}</Button>
      <Button type='primary' onClick={handlePrev}>
        {t('上一步')}
      </Button>
      <Button type='primary' onClick={onOk}>
        {t('提交')}
      </Button>
    </Space>
  )
}

export default Footer
