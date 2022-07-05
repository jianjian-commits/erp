import React, { useEffect, useState } from 'react'
import { Modal, Divider } from 'antd'
import { t } from 'gm-i18n'
import './index.less'
import Step1 from './step1'
import Step2 from './step2'
import Steps from './steps'
import _ from 'lodash'
import { StoreContext } from './store/context'
import store from './store/store'
import leaveConfirm from './leave_confirm'

interface SmartAddFakeOrderProps {
  visible?: boolean
  onClose?: () => void
}

const SmartAddFakeOrder: React.VFC<SmartAddFakeOrderProps> = (props) => {
  const { visible, onClose } = props
  const [step, setStep] = useState(0)

  const onPrev = () => setStep(0)
  const onNext = () => setStep(1)

  const closeModal = () => {
    onPrev()
    if (_.isFunction(onClose)) {
      onClose()
    }
  }

  const handleClose = () => {
    if (step === 1) {
      leaveConfirm({
        onCancel: closeModal,
      })
      return
    }
    closeModal()
  }

  useEffect(() => {
    if (visible) {
      store.init()
    }
  }, [visible])

  return (
    <Modal
      className='smart-add-fake-order'
      visible={visible}
      title={t('智能加单')}
      width={1250}
      footer={null}
      onCancel={handleClose}
      destroyOnClose
      maskClosable={false}
    >
      <StoreContext.Provider value={store}>
        <Steps className='tw-mx-6 tw-w-1/2' current={step}>
          <Divider className='divider' />
          <Steps.Item
            stepKey='step1'
            title={t('设置加单规则、选择商品')}
            description={t('加单总金额将平均分摊到选中的商品中')}
          >
            <Step1 onOk={onNext} onCancel={handleClose} />
          </Steps.Item>
          <Steps.Item
            stepKey='step2'
            title={t('确认加单结果')}
            description={t('还可以针对单个商品进行加单操作')}
            destructible
          >
            <Step2 onPrev={onPrev} onCancel={handleClose} onOk={closeModal} />
          </Steps.Item>
        </Steps>
      </StoreContext.Provider>
    </Modal>
  )
}

export default SmartAddFakeOrder
