import React, { FC } from 'react'
import ReactDOM from 'react-dom'

import './index.less'

interface ModalProps {
  visible: boolean // 是否可见
  onCancel?: React.MouseEventHandler
  maskClosable?: boolean // 遮罩点击是否关闭
  title?: string
}

const SwitchModal: FC<ModalProps> = (props) => {
  const {
    visible = false,
    maskClosable = true,
    title = '标题',
    onCancel,
  } = props

  // 关闭回调
  const handlerClose: React.MouseEventHandler = (event) => {
    onCancel && onCancel(event)
  }

  const handlerCloseMask: React.MouseEventHandler = (event) => {
    if (maskClosable) {
      onCancel && onCancel(event)
    }
  }

  const DialogPor = visible ? (
    <>
      <div className='gm-switch-modal'>
        <div className='gm-switch-modal-close' onClick={handlerClose} />
        <header className='gm-switch-modal-header'>{title}</header>
        <main className='gm-switch-modal-main'>{props.children}</main>
      </div>
      <div className='gm-switch-modal-mask' onClick={handlerCloseMask} />
    </>
  ) : null

  // 传送门到 body 元素里
  return ReactDOM.createPortal(DialogPor, document.body)
}

export default SwitchModal
