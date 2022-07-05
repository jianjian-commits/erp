import React, { FC, useState, useEffect } from 'react'
import { t } from 'gm-i18n'
import {
  Modal,
  Radio,
  RadioChangeEvent,
  Button,
  notification,
  message,
  Form,
} from 'antd'
import { Flex } from '@gm-pc/react'
import SplitTable from './split_table'
import SplitNumberTable from './split_number_table'
import { RadioType, SUPPLIER_MODE } from '../../../../enum'
import classNames from 'classnames'
import { observer } from 'mobx-react'
import splitStore from './store'
import store from '../../store'
import baseStore from '../../../../store'
import Big from 'big.js'
import _ from 'lodash'
import { Sku_SupplierCooperateModelType } from 'gm_api/src/merchandise'
import { PurchaseTask } from 'gm_api/src/purchase'
// import globalStore from '@/stores/global'

interface SplitPurchaserTaskProp {
  visible: boolean
  handleCancel: () => void
}
const SplitPurchaserTask: FC<SplitPurchaserTaskProp> = ({
  visible,
  handleCancel,
}) => {
  const [numberForm] = Form.useForm()
  const [isBatch, setIsBatch] = useState(false)
  const [loading, setLoading] = useState(false)

  const {
    chooseSplitTask,
    init,
    tableList,
    splitBillPurchaseTask,
    splitAmountPurchaseTask,
    numberTable,
  } = splitStore

  const { doRequest } = store
  const { suppliers, fetchSuppliers } = baseStore

  const [value, setValue] = useState(RadioType.bill)

  useEffect(() => {
    if (tableList.length < 2) {
      setValue(RadioType.amount)
    }
    if (
      chooseSplitTask.supplier_cooperate_model_type !==
      Sku_SupplierCooperateModelType.SCMT_JUST_PROVIDE_GOODS
    ) {
      setValue(RadioType.bill)
    }
    fetchSuppliers()
    return () => init()
  }, [])

  /** @description 所有的按钮在这里执行 根据type的不同 */
  const handleOk = () => {
    if (value === RadioType.bill) {
      /** @description 判断是否大于两个供应商 */
      const arr = _.uniq(_.map(tableList, (item) => item.supplier_id))

      if (arr.length < 2) {
        message.destroy()
        message.error(
          t(
            '按单拆分至少选择两个供应商（供应商为空的采购明细行可视作分配给一个供应商）!',
          ),
        )
        return
      }

      setLoading(true)
      splitBillPurchaseTask(value)
        .then((json) => {
          message.success(t('拆分成功!'))
          openNotification(json.response.purchase_tasks)
          doRequest()
          handleCancel()
        })
        .finally(() => setLoading(false))
    } else {
      const arr = _.uniq(_.map(numberTable, (item) => item.supplier_id))
      if (numberTable.length < 2) {
        message.destroy()
        message.error(t('按数量拆分最少为2条最多为10条!'))
        return
      }

      if (arr.length < 2 || arr.length < numberTable.length) {
        message.destroy()
        message.error(t('按数量拆分不允许拆分成同一个供应商！'))
        return
      }
      setLoading(true)
      numberForm
        .validateFields()
        .then(() => {
          // eslint-disable-next-line promise/no-nesting
          splitAmountPurchaseTask(value)
            .then((json) => {
              message.success(t('拆分成功!'))
              doRequest()
              openNotification(json.response.purchase_tasks)
              handleCancel()
            })
            .finally(() => {
              setLoading(false)
            })
        })
        .catch((e) => {
          message.destroy()
          message.error(t('请填写正确的供应商和需求数'))
        })
    }
  }

  /** @description 给的提示框 */
  const openNotification = (purchase_tasks: PurchaseTask[]) => {
    notification.open({
      message: <span className='tw-text-base'>{t('采购计划分配成功')}</span>,
      duration: 3,
      className: 'split-success',
      /** @description 返回回来的数据 */
      description: (
        <>
          {_.map(purchase_tasks, (item) => (
            <div className='split-success-feedback'>
              <span>【{item.serial_no! || '-'}】</span>
              <span>{chooseSplitTask.sku?.name}-</span>
              <span>
                {_.find(suppliers, (i) => i.value === item?.supplier_id)
                  ?.text || ''}
                -
              </span>
              <span>
                {
                  +Big(+item.plan_value?.calculate?.quantity! || 0).div(
                    chooseSplitTask.rate || 1,
                  )
                }
              </span>
              <span>{chooseSplitTask?.unit_name || '-'}</span>
            </div>
          ))}
        </>
      ),
    })
  }

  /** @description 切换选择的判断哪 */
  const handleChange = (e: RadioChangeEvent) => {
    if (
      e.target.value === RadioType.amount &&
      chooseSplitTask.supplier_cooperate_model_type !==
        Sku_SupplierCooperateModelType.SCMT_JUST_PROVIDE_GOODS
    ) {
      message.destroy()
      message.error(t('供应商协作模式为仅供货才能按数量拆分'))
      return
    }
    if (tableList.length < 2 && e.target.value === RadioType.bill) {
      message.destroy()
      message.error(t('原采购计划来源只有一条无法按单拆分！'))
      return
    }
    setValue(e.target.value)
  }

  /** @description 点击批量 */
  const handleIsBatch = () => {
    setIsBatch(true)
  }

  /** @description modal的脚步footer函数 */
  const renderFooter = () => {
    if (value === RadioType.bill && !isBatch) {
      return (
        <Flex justifyEnd>
          <Button onClick={handleCancel}>{t('取消')}</Button>
          <Button onClick={handleOk} type='primary'>
            {t('确定')}
          </Button>
        </Flex>
      )
    }
    if (value === RadioType.amount) {
      return (
        <Flex justifyEnd>
          <Button onClick={handleCancel}>{t('取消')}</Button>
          <Button onClick={handleOk} type='primary'>
            {t('确定')}
          </Button>
        </Flex>
      )
    }
    return null
  }

  return (
    <Modal
      className='split'
      bodyStyle={{ padding: 0 }}
      destroyOnClose
      maskClosable={false}
      visible={visible}
      confirmLoading={loading}
      width={1200}
      title={t('拆分采购计划')}
      onOk={handleOk}
      onCancel={handleCancel}
      footer={renderFooter()}
    >
      <div className='split-header'>
        <strong className='tw-mb-2 tw-block tw-text-lg'>
          {t(chooseSplitTask.sku?.name! || '-')}
        </strong>
        <Flex>
          <span className='tw-mr-11'>
            {t(`等级：${chooseSplitTask.sku_level_name}`)}
          </span>
          <span className='tw-mr-11'>
            {t(
              `需求数：${
                Big(chooseSplitTask.request_value?.calculate?.quantity! || 0)
                  .div(chooseSplitTask?.rate! || 1)
                  .toFixed(4) || 0
              }${chooseSplitTask?.unit_name!}`,
            )}
          </span>
          <span className='tw-mr-11'>
            {t(`原供应商：${chooseSplitTask.supplier?.name! || '-'}`)}
          </span>
          <span className='tw-mr-11'>
            {t(
              `供应商协作模式：${
                // @ts-ignore
                SUPPLIER_MODE[chooseSplitTask.supplier_cooperate_model_type!] ||
                '-'
              }`,
            )}
          </span>
        </Flex>
      </div>
      <div className='split-body'>
        <Flex justifyBetween alignCenter className='tw-h-10'>
          <div>
            <span className='tw-mr-2'>{t('分配方式：')}</span>
            <Radio.Group onChange={handleChange} value={value}>
              <Radio value={RadioType.bill}>{t('按单分配')}</Radio>
              <Radio value={RadioType.amount}>{t('按数量分配')}</Radio>
            </Radio.Group>
            <span
              style={{ color: '#000' }}
              className={classNames({
                'tw-opacity-25': true,
                'tw-hidden': value !== RadioType.amount,
              })}
            >
              {t('（注：按数量分配后将不再关联采购明细）')}
            </span>
          </div>
          {value === RadioType.bill && !isBatch && (
            <span
              onClick={handleIsBatch}
              className='tw-cursor-pointer'
              style={{ color: '#0363FF' }}
            >
              {t('批量设置供应商')}
            </span>
          )}
        </Flex>
        <SplitTable
          isBatch={isBatch}
          className={value !== RadioType.bill ? 'tw-hidden' : ''}
          handleCloseBatch={() => setIsBatch(false)}
        />
        <SplitNumberTable
          form={numberForm}
          className={value !== RadioType.amount ? 'tw-hidden' : ''}
        />
      </div>
    </Modal>
  )
}
export default observer(SplitPurchaserTask)
