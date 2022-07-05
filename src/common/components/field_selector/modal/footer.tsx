import React, { useRef, useState } from 'react'
import { Button, Space } from 'antd'
import { t } from 'gm-i18n'
import { is } from '@gm-common/tool'

export interface FooterProps {
  onClose?: () => void
  onOk?: () => void
}

const Footer: React.VFC<FooterProps> = (props) => {
  const { onClose, onOk } = props

  const [loading, setLoading] = useState(false)

  const timer = useRef<number>()
  const handleOk = () => {
    if (typeof onOk !== 'function') return
    const result = onOk()
    if (!is.promise(result)) return
    window.clearTimeout(timer.current)
    timer.current = window.setTimeout(() => {
      setLoading(true)
    }, 300)
    Promise.resolve(result).finally(() => {
      window.clearTimeout(timer.current)
      setLoading(false)
    })
  }

  const handleClose = () => {
    onClose && onClose()
  }

  return (
    <Space size={16}>
      <Button onClick={handleClose}>{t('取消')}</Button>
      <Button type='primary' onClick={handleOk} loading={loading}>
        {t('保存')}
      </Button>
    </Space>
  )
}

export default Footer
