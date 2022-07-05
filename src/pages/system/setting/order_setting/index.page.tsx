import { t } from 'gm-i18n'
import React, { useEffect, useRef, useState } from 'react'
import { observer } from 'mobx-react'
import {
  FormPanel,
  FormGroup,
  Radio,
  RadioGroup,
  Switch,
  Tip,
  ControlledForm,
  ControlledFormItem,
  CheckboxGroup,
  Checkbox,
} from '@gm-pc/react'
import { Modal, Form, message } from 'antd'
import store from './store'
import {
  COMBINEROUND_CLOSE,
  COMBINEROUND_MID,
  COMBINEROUND_UP,
  COMBINEROUND_WHEN_AFTER,
  COMBINEROUND_WHEN_BEFORE,
} from './enum'
import globalStore from '@/stores/global'
import { Permission } from 'gm_api/src/enterprise'
import {
  OrderSettings_BshopDeleteOrder,
  OrderSettings_MergeOrder,
} from 'gm_api/src/preference/types'
import _ from 'lodash'
import OrderTypes, { OrderTypesRefProps } from './components/order_types'

const OrderSetting = observer(() => {
  const {
    combine_round_method,
    combine_round_when,
    bshop_delete_order,
    bshop_edit_order,
    merge_order,
    order_types,
  } = store.orderData

  const formRef = useRef(null)

  const orderTypeFormRef = useRef<OrderTypesRefProps>(null)

  const [visible, setVisible] = useState<boolean>(false)

  useEffect(() => {
    store.getOrderSettings()
  }, [])

  const handleSave = () => {
    store.updateOrderSettings().then(() => {
      Tip.success(t('保存成功'))
      return store.getOrderSettings()
    })
  }

  const getMergeOrderValue = (): number[] => {
    const values = []
    const { merge_order } = store.orderData
    !!(merge_order & OrderSettings_MergeOrder.MERGEORDER_ERP) &&
      values.push(OrderSettings_MergeOrder.MERGEORDER_ERP)
    !!(merge_order & OrderSettings_MergeOrder.MERGEORDER_BSHOP) &&
      values.push(OrderSettings_MergeOrder.MERGEORDER_BSHOP)
    return values
  }

  const updateOrderTypes = () => {
    orderTypeFormRef?.current!.validate().then(async () => {
      await store.updateCustomizeType(
        orderTypeFormRef?.current!.getOrderTypes()!,
      )
      message.success(t('设置订单类型成功'))
      setVisible(false)
    })
  }

  return (
    <>
      <FormGroup
        disabled={
          !globalStore.hasPermission(
            Permission.PERMISSION_PREFERENCE_UPDATE_ORDER_SETTINGS,
          )
        }
        formRefs={[formRef]}
        onSubmit={handleSave}
      >
        <FormPanel title={t('下单规则设置')}>
          <ControlledForm
            onSubmit={handleSave}
            ref={formRef}
            labelWidth='200px'
            hasButtonInGroup
            disabledCol
          >
            <ControlledFormItem label={t('组合商品下单后原料取整设置')}>
              <>
                <Switch
                  type='primary'
                  checked={combine_round_method !== COMBINEROUND_CLOSE}
                  on={t('开启')}
                  off={t('关闭')}
                  onChange={(bool) => {
                    let value = 0
                    if (bool === false) {
                      value = COMBINEROUND_CLOSE
                    } else {
                      value = COMBINEROUND_UP
                    }
                    store.changeDataItem('combine_round_method', value)
                  }}
                />
                <div className='gm-text-red gm-margin-top-5'>
                  <p className='gm-margin-bottom-5'>
                    {t('仅针对基本单位不为重量单位的商品有效；')}
                  </p>
                  <p>
                    {t(
                      '修改组合商品数量后，原料下单数将再次根据取整规则重新计算；',
                    )}
                  </p>
                </div>
                <div className='gm-text-desc gm-margin-top-5'>
                  <p className='gm-margin-bottom-5'>
                    {t(
                      '关闭后，组合商品下单后根据配比计算出的原料数量不做取整处理，直接展示实际数量；',
                    )}
                  </p>
                  <p>
                    {t(
                      '开启后，组合商品下单后根据配比计算出的原料数量根据设置的规则，展示取整后的数量，如设置向上取整，当数量为11.2根时，则直接展示12根。',
                    )}
                  </p>
                </div>
              </>
            </ControlledFormItem>
            {combine_round_method !== COMBINEROUND_CLOSE && (
              <ControlledFormItem label={t('选择取整规则')}>
                <RadioGroup
                  name='combine_round_method'
                  value={combine_round_method}
                  onChange={(v) =>
                    store.changeDataItem('combine_round_method', v)
                  }
                >
                  <Radio value={COMBINEROUND_UP}>{t('向上取整')}</Radio>
                  <Radio value={COMBINEROUND_MID}>{t('四舍五入')}</Radio>
                </RadioGroup>
              </ControlledFormItem>
            )}
            {combine_round_method !== COMBINEROUND_CLOSE && (
              <ControlledFormItem label={t('多个组合商品的原料相同时规则')}>
                <RadioGroup
                  name='combine_round_when'
                  value={combine_round_when}
                  onChange={(v) =>
                    store.changeDataItem('combine_round_when', v)
                  }
                >
                  <Radio value={COMBINEROUND_WHEN_BEFORE}>
                    {t('原料汇总前根据规则取整再汇总')}
                  </Radio>
                  <Radio value={COMBINEROUND_WHEN_AFTER}>
                    {t('原料汇总后再根据规则取整')}
                  </Radio>
                </RadioGroup>
              </ControlledFormItem>
            )}
            <ControlledFormItem label={t('订单合并设置')}>
              <>
                <Switch
                  type='primary'
                  checked={
                    !(merge_order & OrderSettings_MergeOrder.MERGEORDER_CLOSE)
                  }
                  on={t('开启')}
                  off={t('关闭')}
                  onChange={(bool) => {
                    let value = 0
                    if (bool === false) {
                      value = OrderSettings_MergeOrder.MERGEORDER_CLOSE
                    } else {
                      value =
                        OrderSettings_MergeOrder.MERGEORDER_BSHOP |
                        OrderSettings_MergeOrder.MERGEORDER_ERP
                    }
                    store.changeDataItem('merge_order', value)
                  }}
                />
                <div className='gm-text-desc gm-margin-top-5'>
                  <p className='gm-margin-bottom-5'>
                    {t('关闭后，所有的订单均不允许合并；')}
                  </p>
                  <p>{t('开启后，允许选中的平台端进行订单合并。')}</p>
                </div>
              </>
            </ControlledFormItem>
            {!(merge_order & OrderSettings_MergeOrder.MERGEORDER_CLOSE) && (
              <ControlledFormItem label={t('允许合单')}>
                <>
                  <CheckboxGroup
                    name='merge_order'
                    value={getMergeOrderValue()}
                    onChange={(value) => {
                      value.length !== 0 &&
                        store.changeDataItem('merge_order', value[0] | value[1])
                    }}
                  >
                    <Checkbox
                      key={1}
                      value={OrderSettings_MergeOrder.MERGEORDER_ERP}
                    >
                      {t('PC管理端')}
                    </Checkbox>
                    <Checkbox
                      key={2}
                      value={OrderSettings_MergeOrder.MERGEORDER_BSHOP}
                    >
                      {t('商城端')}
                    </Checkbox>
                  </CheckboxGroup>
                  <div className='gm-text-desc gm-margin-top-5'>
                    <p className='gm-margin-bottom-5'>
                      {t('至少选中其中一项。')}
                    </p>
                  </div>
                </>
              </ControlledFormItem>
            )}
            <ControlledFormItem label={t('订单类型')}>
              <a
                onClick={async () => {
                  await store.getCustomerType()
                  setVisible(true)
                }}
                style={{ position: 'relative', top: 5 }}
              >
                {t('管理')}
              </a>
            </ControlledFormItem>
          </ControlledForm>
        </FormPanel>
        <FormPanel title={t('商城端订单设置')}>
          <ControlledForm
            onSubmit={handleSave}
            form={formRef}
            labelWidth='200px'
            hasButtonInGroup
            disabledCol
          >
            <ControlledFormItem label={t('取消订单设置')}>
              <>
                <Switch
                  type='primary'
                  checked={
                    bshop_delete_order ===
                    OrderSettings_BshopDeleteOrder.BSHOPDELETEORDER_ALLOW
                  }
                  on={t('开启')}
                  off={t('关闭')}
                  onChange={(bool) => {
                    let value = 0
                    if (bool === false) {
                      value =
                        OrderSettings_BshopDeleteOrder.BSHOPDELETEORDER_REJECT
                    } else {
                      value =
                        OrderSettings_BshopDeleteOrder.BSHOPDELETEORDER_ALLOW
                    }
                    store.changeDataItem('bshop_delete_order', value)
                  }}
                />
                <div className='gm-margin-top-5'>
                  <p className='gm-margin-bottom-5'>
                    {t('关闭后，商城端所有的订单均不允许取消；')}
                  </p>
                  <p className='gm-margin-bottom-5'>
                    {t(
                      '开启后，仅允许取消状态为“待分拣”的订单，其他状态不可取消，订单中已经批量发布采购计划（非加工品）、批量发布加工品计划的商品订单不允许取消。',
                    )}
                  </p>
                </div>
              </>
            </ControlledFormItem>
            <ControlledFormItem label={t('修改订单设置')}>
              <>
                <Switch
                  type='primary'
                  checked={bshop_edit_order}
                  on={t('开启')}
                  off={t('关闭')}
                  onChange={(bool) => {
                    store.changeDataItem('bshop_edit_order', bool)
                  }}
                />
                <div className='gm-margin-top-5'>
                  <p className='gm-margin-bottom-5'>
                    {t('关闭后，商城端所有的订单均不允许修改；')}
                  </p>
                  <p className='gm-margin-bottom-5'>
                    {t(
                      '开启后，仅允许修改状态为“待分拣”的订单，且已发布采购计划（非加工品）、加工品计划、已加入对账单、已生成售后单的订单不允许修改。',
                    )}
                  </p>
                </div>
              </>
            </ControlledFormItem>
          </ControlledForm>
        </FormPanel>
      </FormGroup>
      <Modal
        visible={visible}
        title={t('订单类型管理')}
        onOk={updateOrderTypes}
        onCancel={() => setVisible(false)}
        destroyOnClose
      >
        <OrderTypes order_types={order_types} ref={orderTypeFormRef} />
      </Modal>
    </>
  )
})

export default OrderSetting
