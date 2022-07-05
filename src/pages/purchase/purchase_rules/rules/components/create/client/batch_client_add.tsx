import React, { FC, useEffect, useState, useRef } from 'react'
import { t } from 'gm-i18n'
import { message, Modal, Steps, Button } from 'antd'
import { CloseOutlined, ExclamationCircleOutlined } from '@ant-design/icons'
import AddClient from '../components/add_client'
import AddMerchandise from '../components/add_merchandise'
import AddRulesInfo from '../components/add_rules_info'
import { Flex } from '@gm-pc/react'
import createStore from '../store'
import store from '../../../store'
import { observer } from 'mobx-react'
import { AddRulesRef } from '../interface'
import classNames from 'classnames'
const { Step } = Steps
interface BatchClientAddProps {
  visible: boolean
  handleVisible: () => void
}

const BatchClientAdd: FC<BatchClientAddProps> = ({
  visible,
  handleVisible,
}) => {
  const {
    client_selectedRowKeys,
    merchandise_selectedRowKeys,
    init,
    type,
    initList,
    createPurchase,
  } = createStore
  const {
    getClientList,
    refreshPaging,
    setChoose,
    chooseClient,
    getMerchandiseList,
  } = store
  const InfoRefs = useRef<AddRulesRef>(null)

  useEffect(() => {
    return () => {
      init()
    }
  }, [])
  const [step, setStep] = useState(type === 'batchAdd' ? 0 : 1) // 默认是0

  // 关闭所有
  const handleCancelAll = () => {
    Modal.confirm({
      title: t('关闭当前新建'),
      icon: <ExclamationCircleOutlined />,
      content: t('关闭之后数据需要重新添加'),
      okText: '确认',
      onOk: () => {
        setStep(0)
        handleVisible()
        if (chooseClient.customer_id) {
          setChoose({ item: chooseClient, type: 'client' })
        }
      },
      cancelText: '取消',
    })
  }

  // 根据步骤关闭当前东西
  const handleCancel = () => {
    // 0 就取消
    if (step === 0) {
      handleVisible()
    }
    // 1的话判断是否是’add'
    if (step === 1 && type === 'add') {
      handleVisible()
    } else if (step === 2) {
      Modal.confirm({
        title: t('提示'),
        icon: <ExclamationCircleOutlined />,
        content: t('返回上一步后已填写的信息将会失效，确定要离开？'),
        okText: t('继续填写'),
        cancelText: t('上一步'),
        onCancel: () => {
          // 这里list清掉冲重新来 数据源merchandise
          initList('client')
          setStep(1)
        },
      })
    } else {
      // 否则就正常走
      setStep(step - 1)
    }
  }

  // 确认
  const handleOk = async () => {
    // 0的话
    if (step === 0 && client_selectedRowKeys.length === 0) {
      return message.error(t('请选择客户!'))
    }
    if (step === 1 && merchandise_selectedRowKeys.length === 0) {
      return message.error(t('请选择商品!'))
    }
    if (step !== 2) {
      if (step === 1) {
        initList('client')
      }
      setStep(step + 1)
    } else {
      // 检验！
      const res = await InfoRefs.current?.handleVerify()
      if (res) {
        createPurchase('client').then(() => {
          message.success(t('创建成功！'))
          handleVisible()
          refreshPaging('client')
          refreshPaging('merchandise')
          // eslint-disable-next-line promise/no-nesting
          getClientList()
          // eslint-disable-next-line promise/no-nesting
          getMerchandiseList()
        })
      } else {
        message.error(t('供应商、采购员、商品等级最少填写一项'))
      }
    }
  }

  return (
    <Modal
      width={1068}
      visible={visible}
      title={
        <Flex alignCenter justifyBetween className='tw-font-bold'>
          <span>{t('新建采购规则——按客户')}</span>
          <CloseOutlined
            className='tw-cursor-pointer'
            onClick={handleCancelAll}
          />
        </Flex>
      }
      destroyOnClose
      maskClosable={false}
      closable={false}
      footer={[
        step === 2 && (
          <Button key='cancel' onClick={handleCancelAll}>
            {t('取消')}
          </Button>
        ),

        <Button key='pre' onClick={handleCancel}>
          {step === 0
            ? t('取消')
            : type === 'add' && step === 1
            ? t('取消')
            : t('上一步')}
        </Button>,
        <Button key='next' type='primary' onClick={handleOk}>
          {step === 2 ? t('确定') : t('下一步')}
        </Button>,
      ]}
    >
      <Flex>
        <div style={{ width: '80%' }}>
          <Steps current={step} initial={type === 'add' ? 1 : 0}>
            {type === 'batchAdd' && (
              <Step
                // className='tw-hidden'
                title={t('选择客户')}
                description={t('选择一个客户')}
              />
            )}
            <Step
              stepNumber={type === 'add' ? 1 : 2}
              title={t('选择商品')}
              description={t('可选择多个商品')}
            />
            <Step
              stepNumber={type === 'add' ? 2 : 3}
              title={t('填写规则信息')}
            />
          </Steps>
        </div>
      </Flex>
      {step === 0 && type === 'batchAdd' && <AddClient rowType='radio' />}
      <div className={classNames({ 'tw-hidden': step !== 1 })}>
        <AddMerchandise rowType='Checkbox' />
      </div>
      {step === 2 && <AddRulesInfo ref={InfoRefs} columnsType='client' />}
    </Modal>
  )
}
export default observer(BatchClientAdd)
