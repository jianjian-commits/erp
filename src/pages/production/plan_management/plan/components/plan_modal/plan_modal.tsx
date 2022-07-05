import { Modal } from 'antd'
import { ModalProps } from 'antd/lib'
import React, { FC } from 'react'
import './style.less'

const PlanModal: FC<ModalProps> = ({ children, ...res }) => {
  return (
    <Modal {...res} className='plan-modal'>
      {children}
    </Modal>
  )
}

export default PlanModal
