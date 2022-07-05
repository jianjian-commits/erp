import React, {
  useState,
  useImperativeHandle,
  forwardRef,
  ReactNode,
} from 'react'
import { Modal, Steps } from 'antd'
import { t } from 'gm-i18n'
import InfoTable from './info_table'
import store from './store'
import AddMerchandise from './add_merchandise'
import classNames from 'classnames'
import '../style.less'

const { Step } = Steps

const steps = [
  {
    title: t('添加商品'),
    content: 'First-content',
  },
  {
    title: t('填写报价信息'),
    content: 'Second-content',
  },
]

export interface AssociatedGoodsRef {
  handleOpen: () => void
  handleClose: () => void
}

interface AssociatedGoodsProps {
  title: ReactNode
}

/** 关联商品 */
const AssociatedGoods = forwardRef<AssociatedGoodsRef, AssociatedGoodsProps>(
  (props, ref) => {
    const { title } = props
    const [visible, setVisible] = useState(false)
    const [current, setCurrent] = useState(0)

    const handleOpen = () => {
      setVisible(true)
      setCurrent(0)
      store.clearStore()
    }

    const onCancel = () => {
      /** 第二步才需要二次确认 */
      if (current === 1) {
        Modal.confirm({
          title: t('提示'),
          content: t('取消后已填写的信息将会失效，确定要离开？'),
          okText: t('继续填写'),
          cancelText: t('离开'),
          onCancel: () => {
            handleClose()
          },
        })
      } else {
        handleClose()
      }
    }

    const handleClose = () => {
      setVisible(false)
      setCurrent(0)
      store.clearStore()
    }

    useImperativeHandle(ref, () => ({
      handleOpen,
      handleClose,
    }))

    const next = () => {
      setCurrent(current + 1)
    }

    const prev = () => {
      setCurrent(current - 1)
    }

    return (
      <Modal
        title={title}
        destroyOnClose
        style={{ top: 20 }}
        visible={visible}
        onCancel={onCancel}
        maskClosable={false}
        bodyStyle={{ margin: '0px 16px', padding: '16px 16px 0 16px' }}
        width={1250}
      >
        <div style={{ width: '360px' }}>
          <Steps current={current}>
            {steps.map((item) => (
              <Step key={item.title} title={item.title} />
            ))}
          </Steps>
        </div>
        <div className='line' />
        {/* 如果返回上一步重新渲染 preserveSelectedRowKeys 这个属性将会失效 */}
        <div className={classNames({ 'hidden-table': current === 1 })}>
          <AddMerchandise next={next} handleClose={handleClose} />
        </div>

        {current === 1 && <InfoTable prev={prev} handleClose={handleClose} />}
      </Modal>
    )
  },
)

export default AssociatedGoods
