import { PlanModal } from '@/pages/production/plan_management/plan/components/plan_modal'
import React, { FC } from 'react'
import { t } from 'gm-i18n'
import store from '@/pages/production/plan_management/plan/store'
import { OneClickReleaseByProductionOrder } from 'gm_api/src/production'
import { PlanModalProps } from '@/pages/production/plan_management/plan/interface'
import globalStore from '@/stores/global'

const ReleaseTaskModal: FC<PlanModalProps> = ({ visible, onChangeVisible }) => {
  const { productionOrderId } = store.producePlanCondition
  const handleCancel = () => {
    onChangeVisible()
  }
  const handleReleaseTask = () => {
    OneClickReleaseByProductionOrder({
      production_order_id: productionOrderId,
    }).then(() => {
      onChangeVisible()
      globalStore.showTaskPanel('1')
    })
  }
  return (
    <PlanModal
      title={t('一键下达任务')}
      visible={visible}
      onCancel={handleCancel}
      onOk={handleReleaseTask}
    >
      <div>{t('说明')}</div>
      <div>
        {t(
          `1、批量下达需求时，按计划生产/包装数下达，需求状态为未下达时才可下达需求；`,
        )}
      </div>
      <div>
        {t(`2、生产/包装任务按默认规则生成，规则可在设置-生产设置中查看。`)}
      </div>
    </PlanModal>
  )
}

export default ReleaseTaskModal
