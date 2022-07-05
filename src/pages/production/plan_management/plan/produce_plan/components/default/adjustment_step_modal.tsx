import { ProcessedProductPlan } from '@/pages/order/order_manage/list/components/product_plan'
import { PlanModal } from '@/pages/production/plan_management/plan/components/plan_modal'
import {
  AdjustmentTabs,
  Plan_Process,
} from '@/pages/production/plan_management/plan/enum'
import { PlanModalProps } from '@/pages/production/plan_management/plan/interface'
import DemanPlan from '@/pages/production/plan_management/plan/produce_plan/components/default/demand/demand_plan'
import DemanTable from '@/pages/production/plan_management/plan/produce_plan/components/default/demand/demand_table'
import globalStore from '@/stores/global'
import { Tip } from '@gm-pc/react'
import { Button, Steps, message } from 'antd'
import { t } from 'gm-i18n'
import { DispatchProductionTaskFromOrder } from 'gm_api/src/orderlogic'
import { PlaningTask } from 'gm_api/src/production'
import _ from 'lodash'
import React, { useState, FC, useRef, Key } from 'react'
import OrderTable from './order/order_table'
import planStore from '@/pages/production/plan_management/plan/store'
import demanStore from '@/pages/production/plan_management/plan/demand/store'
import { ProductPlanParams } from '@/pages/order/order_manage/list/components/product_plan/interface'

const { Step } = Steps

interface Props extends PlanModalProps {
  isDemand: boolean
}

const AdjustmentStepModal: FC<Props> = ({
  visible,
  onChangeVisible,
  isDemand,
}) => {
  /** 订单需求统一管理 */
  const ref =
    useRef<{ getParams?: () => void; getTaskParams?: () => Promise<any> }>()
  const selectID = useRef<Key[]>([])
  const [step, setStep] = useState(0)
  const { tab, productionOrderId, productionOrder } =
    planStore.producePlanCondition
  const defaultOrder = [productionOrder?.delivery_time!, productionOrderId]
  const stepData = AdjustmentTabs[isDemand ? 0 : 1]
  const handleCancel = () => {
    onChangeVisible()
  }

  const handleOk = () => {
    if (isDemand) {
      handleTask()
      return
    }
    handleOrder()
  }

  const handleTask = async () => {
    const data = await ref.current?.getTaskParams!()
    PlaningTask(data).then(() => {
      finish()
      tab === Plan_Process.demand && demanStore.doRequest()
    })
  }

  /** 需要更新设置 */
  const handleOrder = () => {
    const { params, saveSetting } = ref.current
      ?.getParams!() as unknown as ProductPlanParams
    DispatchProductionTaskFromOrder({ ...params }).then(async () => {
      await saveSetting()
      finish()
      globalStore.showTaskPanel('1')
    })
  }

  const finish = () => {
    Tip.success(t('发布成功!'))
    onChangeVisible()
  }

  const handleSelect = (idS: Key[]) => {
    selectID.current = idS
  }

  const handleChangeStep = () => {
    if (step === 0 && !selectID.current?.length) {
      message.warning(t(`请选择${isDemand ? '需求' : '商品'}`))
      return
    }

    setStep((v) => (v === 0 ? 1 : 0))
  }

  const stepItem = () => {
    const demeanItem = [
      { element: <DemanTable onSelect={handleSelect} /> },
      {
        element: (
          <div className='gm-padding-top-20'>
            <DemanPlan
              ref={ref}
              selected={selectID.current}
              defaultOrder={defaultOrder}
            />
          </div>
        ),
      },
    ]
    const orderItem = [
      { element: <OrderTable onSelect={handleSelect} /> },
      {
        element: (
          <div className='gm-padding-top-5'>
            <ProcessedProductPlan
              defaultValue={{
                pack_order: defaultOrder,
                productio_order: defaultOrder,
                production_cleanfood_order: defaultOrder,
              }}
              isSelectAll={false}
              selected={selectID.current as string[]}
              ref={ref}
            />
          </div>
        ),
      },
    ]
    return _.map(isDemand ? demeanItem : orderItem, (v, index) => (
      <div style={step !== index ? { display: 'none' } : undefined}>
        {v.element}
      </div>
    ))
  }

  const init = () => {
    ref.current = undefined
    selectID.current = []
    setStep(0)
  }

  return (
    <PlanModal
      title={t(`${stepData.title}`)}
      bodyStyle={{ height: 700, overflowY: 'auto', padding: '24px 0' }}
      visible={visible}
      onCancel={handleCancel}
      afterClose={init}
      destroyOnClose
      wrapClassName='b-adjustment-modal'
      footer={
        <div>
          <Button onClick={handleCancel}>{t('取消')}</Button>
          {step === 0 ? (
            <Button type='primary' onClick={handleChangeStep}>
              {t('下一步')}
            </Button>
          ) : (
            <>
              <Button onClick={handleChangeStep}>{t('上一步')}</Button>
              <Button type='primary' onClick={handleOk}>
                {t('提交')}
              </Button>
            </>
          )}
        </div>
      }
    >
      <>
        <Steps
          onChange={handleChangeStep}
          current={step}
          className='gm-padding-lr-20'
          style={{ width: '700px' }}
        >
          {_.map(stepData.step, ({ title, description }) => (
            <Step title={title} description={description} />
          ))}
        </Steps>
        <div className='gm-padding-lr-20 gm-border-top'>{stepItem()}</div>
      </>
    </PlanModal>
  )
}

export default AdjustmentStepModal
