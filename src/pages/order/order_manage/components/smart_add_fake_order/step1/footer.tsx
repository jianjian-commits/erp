import React from 'react'
import { Button, Space } from 'antd'
import { t } from 'gm-i18n'

export interface FooterProps {
  onCancel?: React.MouseEventHandler<HTMLElement>
  onOk?: React.MouseEventHandler<HTMLElement>
  disabledOk?: boolean
}

const Footer: React.VFC<FooterProps> = (props) => {
  const { onCancel, onOk, disabledOk } = props
  return (
    <Space size={16}>
      <Button onClick={onCancel}>{t('取消')}</Button>
      <Button type='primary' disabled={disabledOk} onClick={onOk}>
        {t('一键加单')}
      </Button>
    </Space>
  )
}

export default Footer
