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

interface BatchMerchandiseAddProps {
  visible: boolean
  handleVisible: () => void
}
const BatchMerchandiseAdd: FC<BatchMerchandiseAddProps> = ({
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
    getMerchandiseList,
    refreshPaging,
    setChoose,
    chooseSku,
    getClientList,
  } = store
  useEffect(() => {
    return () => {
      init()
    }
  }, [])

  const [step, setStep] = useState(type === 'batchAdd' ? 0 : 1) // 默认是0
  const InfoRefs = useRef<AddRulesRef>(null)

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
        if (chooseSku.sku_id) {
          setChoose({ item: chooseSku, type: 'merchandise' })
        }
      },
      cancelText: '取消',
    })
  }

  const handleCancel = () => {
    // 0 就取消
    if (step === 0) {
      handleVisible()
    }
    if (step === 1 && type === 'add') {
      handleVisible()
    } else if (step === 2) {
      Modal.confirm({
        title: t('提示'),
        icon: <ExclamationCircleOutlined />,
        content: t('返回上一步后已填写的信息将会失效，确定要离开？'),
        okText: t('继续填写'),
        cancelText: t('上一步'),
        onCancel: async () => {
          // 这里list清掉冲重新来,数据源Client
          await initList('merchandise')
          setStep(1)
        },
      })
    } else {
      // 否则就正常走
      setStep(step - 1)
    }
  }
  const handleOk = async () => {
    // 0的话
    if (step === 0 && merchandise_selectedRowKeys.length === 0) {
      return message.error(t('请选择商品!'))
    }
    if (step === 1 && client_selectedRowKeys.length === 0) {
      return message.error(t('请选择客户!'))
    }
    if (step !== 2) {
      if (step === 1) {
        await initList('merchandise')
      }
      setStep(step + 1)
    } else {
      // 检验！
      const res = await InfoRefs.current?.handleVerify()
      if (res) {
        createPurchase('merchandise').then(() => {
          handleVisible()
          refreshPaging('merchandise')
          refreshPaging('client')
          // eslint-disable-next-line promise/no-nesting
          getMerchandiseList()
          // eslint-disable-next-line promise/no-nesting
          getClientList()
          message.success(t('创建成功!'))
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
          <span>{t('新建采购规则——按商品')}</span>
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
              <Step title={t('选择商品')} description={t('选择一个商品')} />
            )}
            <Step
              stepNumber={type === 'add' ? 1 : 2}
              title={t('选择客户')}
              description={t('可选择多个客户')}
            />
            <Step
              stepNumber={type === 'add' ? 2 : 3}
              title={t('填写规则信息')}
            />
          </Steps>
        </div>
      </Flex>
      {step === 0 && type === 'batchAdd' && <AddMerchandise rowType='radio' />}

      <div className={classNames({ 'tw-hidden': step !== 1 })}>
        <AddClient rowType='CheckBox' />
      </div>

      {step === 2 && <AddRulesInfo ref={InfoRefs} columnsType='merchandise' />}
    </Modal>
  )
}
export default observer(BatchMerchandiseAdd)
